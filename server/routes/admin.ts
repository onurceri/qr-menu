import express, { Response, Router, Request } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { adminAuthMiddleware, AuthRequest } from '../middleware/adminAuth.js';
import OpenAI from 'openai';
import multer from 'multer';

const router: Router = express.Router();

// Admin middleware'i tüm route'lar için kullanılacak
router.use(adminAuthMiddleware as express.RequestHandler);

// OpenAI konfigürasyonu
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Görsel arama fonksiyonu
async function searchImage(itemName: string, language: string): Promise<string | null> {
  try {
    const searchQuery = await generateOptimizedSearchQuery(itemName, language);
    console.log("Search query:", searchQuery);
    
    const params = [
      `key=${process.env.GOOGLE_API_KEY}`,
      `cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}`,
      `q=${searchQuery}`,
      'searchType=image',
      'imgSize=xlarge',
      'imgType=photo',
      'fileType=jpg,png',
      'safe=active',
      'num=5',
      'gl=US'
    ];

    const url = `https://www.googleapis.com/customsearch/v1?${params.join('&')}`;
    console.log("URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
 
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const imageUrl = item.link;
        console.log("imageUrl:", imageUrl);
        if (
          imageUrl.match(/\.(jpg|jpeg|png)$/i) && 
          !imageUrl.includes('tiktok.com') &&
          !imageUrl.includes('instagram.com') &&
          !imageUrl.includes('facebook.com') &&
          !imageUrl.includes('youtube.com') &&
          await isValidImageUrl(imageUrl)
        ) {
          return imageUrl;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Image search failed:', error);
    return null;
  }
}

// OpenAI sorgu optimizasyonu
async function generateOptimizedSearchQuery(itemName: string, language: string): Promise<string> {
  let threadId: string | undefined;
  
  try {
    // Assistant thread oluştur
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    
    console.log('Thread created:', threadId);

    // Mesajı gönder - itemName ve language bilgisini JSON olarak gönder
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: JSON.stringify({
        itemName,
        language
      })
    });
    
    console.log('Message sent for item:', { itemName, language });

    // Assistant'ı çalıştır
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_IMAGE_QUERY_BUILDER_ASSISTANT_ID!
    });
    
    console.log('Run started:', run.id);

    // Sonucu bekle
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed') {
        console.error('Run failed:', runStatus);
        throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
      }
      
      console.log('Run status:', runStatus.status);
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Sonucu al
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];
    
    console.log('Raw response:', lastMessage.content[0]);

    if (!lastMessage.content[0] || lastMessage.content[0].type !== 'text') {
      throw new Error('Invalid response format');
    }

    // Content'in text özelliğini kontrol et
    const textContent = lastMessage.content[0].text;
    if (typeof textContent === 'object' && 'value' in textContent) {
      // JSON yanıtını parse et
      try {
        const response = JSON.parse(textContent.value);
        console.log('Parsed response:', response);

        if (!response || typeof response !== 'object') {
          throw new Error('Response is not an object');
        }

        if (!response.searchQuery || typeof response.searchQuery !== 'string') {
          console.error('Invalid searchQuery:', response.searchQuery);
          throw new Error('Invalid or missing searchQuery');
        }

        return encodeURIComponent(response.searchQuery);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw text:', textContent.value);
        throw new Error('Failed to parse JSON response');
      }
    } else {
      throw new Error('Invalid text content format');
    }

  } catch (error) {
    console.error('Failed to generate optimized search query:', error);
    console.error('Error details:', {
      itemName,
      language,
      threadId
    });
    return encodeURIComponent(`${itemName} food photography -recipe -menu -social`);
  } finally {
    // Thread'i temizle
    if (threadId) {
      try {
        await openai.beta.threads.del(threadId);
        console.log('Thread cleaned up:', threadId);
      } catch (cleanupError) {
        console.error('Failed to cleanup thread:', cleanupError);
      }
    }
  }
}

// URL'in geçerli bir görsel olup olmadığını kontrol et
async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    
    if (!contentType) {
      return false;
    }

    return (
      contentType.startsWith('image/') &&
      (contentType.includes('jpeg') || contentType.includes('png')) &&
      response.ok
    );
  } catch {
    return false;
  }
}

// Generate images endpoint
router.post('/generate-images/:menuId', async (req: AuthRequest, res: Response) => {
  try {
    const { menuId } = req.params;
    
    const restaurant = await Restaurant.findOne({ 'menus.id': menuId });
    if (!restaurant) {
      res.status(404).json({ error: 'Menu not found' });
      return;
    }

    const menuIndex = restaurant.menus.findIndex(m => m.id === menuId);
    if (menuIndex === -1) {
      res.status(404).json({ error: 'Menu not found' });
      return;
    }

    const menu = restaurant.menus[menuIndex];
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const section of menu.sections) {
      for (const item of section.items) {
        if (item.imageUrl) {
          skippedCount++;
          //continue;
        }

        try {
          const imageUrl = await searchImage(item.name, menu.language);
          
          if (imageUrl && await isValidImageUrl(imageUrl)) {
            item.imageUrl = imageUrl;
            updatedCount++;
          } else {
            errorCount++;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to generate image for item: ${item.name}`, error);
          errorCount++;
        }
      }
    }

    await restaurant.save();

    res.json({
      message: 'Image generation completed',
      stats: {
        updated: updatedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Generate images failed:', error);
    res.status(500).json({ error: 'Failed to generate images' });
  }
});

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
      cb(new Error('Only JPG, JPEG and PNG files are allowed'));
      return;
    }
    cb(null, true);
  }
});

// AuthRequest interface'ini güncelle
interface ExtendedAuthRequest extends AuthRequest {
  files: Express.Multer.File[];
}

// Custom RequestHandler type
type CustomRequestHandler = (
  req: ExtendedAuthRequest,
  res: Response,
  next: express.NextFunction
) => Promise<void | Response>;

// Menu OCR endpoint
const extractMenuHandler: CustomRequestHandler = async (req, res) => {
  try {
    const { restaurantId, language } = req.body;
    
    if (!req.files || req.files.length === 0) {
      console.log('Files received:', req.files);
      return res.status(400).json({ 
        error: 'Menu images are required',
        filesReceived: req.files 
      });
    }

    console.log('Number of images received:', req.files.length); // Debug için

    // Tüm fotoğraflardan menu datası çıkar
    const allMenuData = [];
    for (const menuImage of req.files) {
      // Dosya tipini kontrol et
      if (!menuImage.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
        return res.status(400).json({ 
          error: `Invalid file type for ${menuImage.originalname}. Only JPEG, PNG and JPG are allowed` 
        });
      }

      // Base64'e çevir
      const base64Image = menuImage.buffer.toString('base64');

      // OpenAI'ye gönder
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Extract menu items from this menu image and return in JSON format:
                {
                  "name": "Menu Name",
                  "sections": [
                    {
                      "title": "Section Title",
                      "items": [
                        {
                          "name": "Item Name",
                          "description": "Item Description",
                          "price": number
                        }
                      ]
                    }
                  ]
                }
                
                Guidelines:
                - Keep original item names in ${language} language
                - Create clear, concise descriptions
                - Extract exact prices if visible
                - Group similar items into logical sections
                - If price is not visible, use 0
                - If description is not available, use empty string
                - Convert prices to numbers (remove currency symbols)
                - Create appropriate section titles based on item types` 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${menuImage.mimetype};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      let menuData;
      try {
        menuData = JSON.parse(response.choices[0].message.content || '{}');
        console.log('Parsed menu data:', menuData);
        allMenuData.push(menuData);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw response:', response.choices[0].message.content);
        return res.status(500).json({ error: 'Failed to parse menu data' });
      }
    }

    // Restaurant'ı bul
    const restaurant = await Restaurant.findOne({ restaurantId });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Mevcut menüyü bul
    const existingMenuIndex = restaurant.menus.findIndex(m => m.language === language);
    let newMenu;

    if (existingMenuIndex !== -1) {
      const existingMenu = restaurant.menus[existingMenuIndex];
      const mergedSections = [...existingMenu.sections];
      
      for (const menuData of allMenuData) {
        for (const newSection of menuData.sections) {
          const existingSectionIndex = mergedSections.findIndex(
            s => s.title.toLowerCase() === newSection.title.toLowerCase()
          );

          if (existingSectionIndex !== -1) {
            const existingSection = mergedSections[existingSectionIndex];
            for (const newItem of newSection.items) {
              const existingItemIndex = existingSection.items.findIndex(
                (i: { name: string }) => i.name.toLowerCase() === newItem.name.toLowerCase()
              );

              if (existingItemIndex === -1) {
                existingSection.items.push({
                  id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: newItem.name,
                  description: newItem.description || '',
                  price: newItem.price || 0,
                  imageUrl: ''
                });
              }
            }
          } else {
            mergedSections.push({
              id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: newSection.title,
              items: newSection.items.map((item: { name: string; description?: string; price?: number }) => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: item.name,
                description: item.description || '',
                price: item.price || 0,
                imageUrl: ''
              }))
            });
          }
        }
      }

      newMenu = {
        ...existingMenu,
        sections: mergedSections
      };
    } else {
      const mergedSections = [];
      
      for (const menuData of allMenuData) {
        for (const section of menuData.sections) {
          const existingSectionIndex = mergedSections.findIndex(
            s => s.title.toLowerCase() === section.title.toLowerCase()
          );

          if (existingSectionIndex === -1) {
            mergedSections.push({
              id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: section.title,
              items: section.items.map((item: { name: string; description?: string; price?: number }) => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: item.name,
                description: item.description || '',
                price: item.price || 0,
                imageUrl: ''
              }))
            });
          } else {
            for (const item of section.items) {
              const existingItemIndex = mergedSections[existingSectionIndex].items.findIndex(
                (i: { name: string }) => i.name.toLowerCase() === item.name.toLowerCase()
              );

              if (existingItemIndex === -1) {
                mergedSections[existingSectionIndex].items.push({
                  id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: item.name,
                  description: item.description || '',
                  price: item.price || 0,
                  imageUrl: ''
                });
              }
            }
          }
        }
      }

      newMenu = {
        id: `menu-${Date.now()}`,
        language,
        name: allMenuData[0]?.name || 'Menu',
        description: '',
        currency: 'TRY',
        sections: mergedSections
      };
    }

    // Menüyü kaydet
    if (existingMenuIndex !== -1) {
      restaurant.menus[existingMenuIndex] = newMenu;
    } else {
      restaurant.menus.push(newMenu);
    }

    await restaurant.save();

    res.json({
      message: 'Menu extracted and saved successfully',
      menu: newMenu
    });

  } catch (error) {
    console.error('Menu extraction failed:', error);
    res.status(500).json({ error: 'Failed to extract menu' });
  }
};

// Route tanımlaması - multer middleware'i ekle
router.post('/extract-menu', upload.array('images'), extractMenuHandler as express.RequestHandler);

export default router; 