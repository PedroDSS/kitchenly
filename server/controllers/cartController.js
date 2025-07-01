import Cart from '../models/postgres/cartModel.js';
import Product from '../models/postgres/productModel.js';
import Images from '../models/postgres/imagesModel.js';

export const addToCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findByPk(productId);
    if (!product || product.product_stock <= 0) {
      return res.sendStatus(404);
    }

    let cartItem = await Cart.findOne({ where: { productId, userId } });

    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.reservedUntil = new Date(Date.now() + 3 * 60 * 100); // 30 secondes
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        productId,
        userId,
        quantity: 1,
        reservedUntil: new Date(Date.now() + 3 * 60 * 100), // 30 secondes
      });
    }

    product.product_stock--;
    await product.save();

    const detailedCartItem = await Cart.findOne({
      where: { id: cartItem.id },
      include: [{
        model: Product,
        as: 'Product',
        include: [{
          model: Images,
          as: 'images',
          attributes: ['url']
        }]
      }],
    });

    // Transform the data to include imageUrls
    const cartItemJSON = detailedCartItem.toJSON();
    if (cartItemJSON.Product && cartItemJSON.Product.images) {
      cartItemJSON.Product.imageUrls = cartItemJSON.Product.images.map(img => img.url);
    }

    res.status(201).json(cartItemJSON);

    // Schedule the removal of the cart item
    setTimeout(async () => {
      const currentTime = new Date();
      const item = await Cart.findOne({ where: { id: cartItem.id } });
      if (item && item.reservedUntil < currentTime) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.product_stock++;
          await product.save();
        }
        await Cart.destroy({ where: { id: item.id } });
      }
    }, 3 * 60 * 100); // 30 secondes
  } catch (error) {
    res.sendStatus(500);
  }
};



export const removeFromCart = async (req, res) => {
  const { cartItemId } = req.body;
  const userId = req.user.id;

  try {
    const cartItem = await Cart.findOne({ where: { id: cartItemId, userId }, include: [{ model: Product, as: 'Product', include: [{ model: Images, as: 'images', attributes: ['url'] }] }] });

    const product = await Product.findByPk(cartItem.productId);
    if (product) {
      product.product_stock++;
      await product.save();
    }

    await Cart.destroy({ where: { id: cartItem.id } });

    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500);
  }
};

export const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const carts = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'Product',
        include: [{
          model: Images,
          as: 'images',
          attributes: ['url']
        }]
      }],
    });
    
    // Transform the data to include imageUrls
    const cartsWithImageUrls = carts.map(cart => {
      const cartJSON = cart.toJSON();
      if (cartJSON.Product && cartJSON.Product.images) {
        cartJSON.Product.imageUrls = cartJSON.Product.images.map(img => img.url);
      }
      return cartJSON;
    });
    
    res.status(200).json(cartsWithImageUrls);
  } catch (error) {
    res.sendStatus(500);
  }
};

export const updateCartQuantity = async (req, res) => {
  const { cartItemId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const cartItem = await Cart.findOne({ where: { id: cartItemId, userId }, include: [{ model: Product, as: 'Product', include: [{ model: Images, as: 'images', attributes: ['url'] }] }] });
    if (!cartItem) {
      return res.sendStatus(404);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Transform the data to include imageUrls
    const cartItemJSON = cartItem.toJSON();
    if (cartItemJSON.Product && cartItemJSON.Product.images) {
      cartItemJSON.Product.imageUrls = cartItemJSON.Product.images.map(img => img.url);
    }

    res.status(200).json(cartItemJSON);
  } catch (error) {
    res.sendStatus(500);
  }
};
