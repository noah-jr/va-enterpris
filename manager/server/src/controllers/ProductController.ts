import { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { PredictionService } from '../services/PredictionService';

export class ProductController {
    static async index(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const products = await ProductModel.getAllProducts(companyId);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while fetching products' });
        }
    }

    static async show(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;

            const product = await ProductModel.getProductById(id, companyId);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            res.json(product);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while fetching product' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const { name, code, description, price, cost, vatRate, stock, minStock, supplierId, category, unit, type, classification } = req.body;

            let imageUrl = undefined;
            if (req.file) {
                // multer-s3 uses .location, others use .path
                const file = req.file as any;
                imageUrl = file.location || file.path;
                
                // If local path, ensure it's relative to root or full URL
                if (process.env.STORAGE_PROVIDER === 'local' || !process.env.STORAGE_PROVIDER) {
                    const host = req.get('host');
                    const protocol = req.protocol;
                    // Ensure the path is relative to the uploads folder correctly
                    // req.file.path usually contains the full path including 'uploads/'
                    imageUrl = `${protocol}://${host}/${file.path.replace(/\\/g, '/')}`;
                }
            } else if (req.body.imageUrl) {
                imageUrl = req.body.imageUrl;
            }

            // Optional: generate code if not provided
            const finalCode = code || `PRD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

            // Ensure unique code
            const existingCode = await ProductModel.getProductByCode(finalCode, companyId);
            if (existingCode) return res.status(400).json({ error: 'A product with this code already exists' });

            const newProduct = await ProductModel.createProduct({
                companyId,
                name,
                code: finalCode,
                type: type || 'PRODUCT',
                description: description || null,
                category: category || 'DIVERSOS',
                unit: unit || 'UN',
                purchasePrice: Number(cost) || 0,
                salePrice: Number(price) || 0,
                price: Number(price) || 0,
                cost: cost ? Number(cost) : 0,
                vatRate: Number(vatRate) || 14, // Default VAT for Angola
                margin: Number(price) > 0 && Number(cost) > 0 ? ((Number(price) - Number(cost)) / Number(price)) * 100 : 0,
                stock: stock !== undefined ? Number(stock) : 0,
                minStock: minStock !== undefined ? Number(minStock) : 5,
                supplierId: supplierId || null,
                imageUrl,
                classification: classification || null
            } as any);



            res.status(201).json(newProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error while creating product' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;
            const data = req.body;

            let imageUrl = undefined;
            if (req.file) {
                const file = req.file as any;
                imageUrl = file.location || file.path;
                if (process.env.STORAGE_PROVIDER === 'local' || !process.env.STORAGE_PROVIDER) {
                    const host = req.get('host');
                    const protocol = req.protocol;
                    imageUrl = `${protocol}://${host}/${file.path.replace(/\\/g, '/')}`;
                }
            } else if (req.body.imageUrl) {
                imageUrl = req.body.imageUrl;
            }

            // Only allow partial updates, calculate margin if price/cost are updated
            const updatePayload: any = { ...data };
            if (imageUrl) {
                updatePayload.imageUrl = imageUrl;
            }
            if (data.price !== undefined) updatePayload.price = Number(data.price);
            if (data.cost !== undefined) updatePayload.cost = Number(data.cost);
            if (data.stock !== undefined) updatePayload.stock = Number(data.stock);
            if (data.vatRate !== undefined) updatePayload.vatRate = Number(data.vatRate);
            if (data.minStock !== undefined) updatePayload.minStock = Number(data.minStock);
            if (data.price !== undefined || data.cost !== undefined) {
                // To accurately calculate we would need the old product if one is missing, but for simplicity assuming we update both if we recalculate margin.
                // Or let the service layer / database trigger handle complex calculations.
            }

            const updatedProduct = await ProductModel.updateProduct(id, companyId, updatePayload);
            if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

            res.json(updatedProduct);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while updating product' });
        }
    }

    static async destroy(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const id = req.params.id as string;

            const success = await ProductModel.deleteProduct(id, companyId);
            if (!success) return res.status(404).json({ error: 'Product not found' });

            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error while deleting product' });
        }
    }

    static async getPredictions(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const predictions = await PredictionService.getStockPredictions(companyId);
            res.json(predictions);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao gerar previsões de IA' });
        }
    }
}
