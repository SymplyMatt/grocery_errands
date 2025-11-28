import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from './config/mongodb';
import { User, UserAuth, Order, OrderProduct, Product, ProductOption, Location } from './models';
import { OrderStatus, PaymentMethod } from './models/interfaces';

dotenv.config();

const PASSWORD = 'Password123!!!';
const NUM_USERS = 50;
const ORDERS_PER_USER = 50;
const ADDITIONAL_ORDERS_THIS_YEAR = 1000;

// Sample data for generating users
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica',
  'Robert', 'Amanda', 'William', 'Melissa', 'Richard', 'Michelle', 'Joseph',
  'Kimberly', 'Thomas', 'Ashley', 'Charles', 'Stephanie', 'Daniel', 'Nicole',
  'Matthew', 'Elizabeth', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald',
  'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua',
  'Laura', 'Kenneth', 'Kim', 'Kevin', 'Deborah', 'Brian', 'Lisa', 'George',
  'Nancy', 'Edward', 'Betty', 'Ronald', 'Margaret'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
  'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
  'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter',
  'Roberts', 'Gomez', 'Phillips'
];

const states = [
  'Lagos', 'Abuja', 'Kano', 'Rivers', 'Ogun', 'Delta', 'Kaduna', 'Oyo',
  'Enugu', 'Anambra', 'Imo', 'Akwa Ibom', 'Cross River', 'Plateau', 'Benue',
  'Edo', 'Kwara', 'Osun', 'Ekiti', 'Bayelsa'
];

const orderStatuses: OrderStatus[] = ['PENDING', 'DELIVERED', 'PAID'];
const paymentMethods: PaymentMethod[] = ['TOPUP', 'PAYSTACK'];

// Generate random date between start and end dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random phone number
function generatePhoneNumber(index: number): string {
  const prefix = ['080', '081', '070', '090', '091'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const suffix = String(index).padStart(8, '0');
  return `${randomPrefix}${suffix}`;
}

// Generate unique email
function generateEmail(firstname: string, lastname: string, index: number): string {
  return `${firstname.toLowerCase()}.${lastname.toLowerCase()}${index}@example.com`;
}

// Generate unique username
function generateUsername(firstname: string, lastname: string, index: number): string {
  return `${firstname.toLowerCase()}${lastname.toLowerCase()}${index}`;
}

async function ensureProductsExist(): Promise<{ products: any[], productOptions: any[] }> {
  // Check if products exist
  const existingProducts = await Product.find({ deletedAt: null }).limit(10);
  
  if (existingProducts.length === 0) {
    console.log('No products found. Creating sample products...');
    
    // Create sample products
    const sampleProducts = [
      { name: 'Rice', description: 'Premium quality rice', image: 'https://example.com/rice.jpg', inSeason: true },
      { name: 'Beans', description: 'Fresh beans', image: 'https://example.com/beans.jpg', inSeason: true },
      { name: 'Tomatoes', description: 'Fresh tomatoes', image: 'https://example.com/tomatoes.jpg', inSeason: true },
      { name: 'Onions', description: 'Fresh onions', image: 'https://example.com/onions.jpg', inSeason: true },
      { name: 'Pepper', description: 'Hot pepper', image: 'https://example.com/pepper.jpg', inSeason: true },
      { name: 'Garlic', description: 'Fresh garlic', image: 'https://example.com/garlic.jpg', inSeason: true },
      { name: 'Ginger', description: 'Fresh ginger', image: 'https://example.com/ginger.jpg', inSeason: true },
      { name: 'Potatoes', description: 'Fresh potatoes', image: 'https://example.com/potatoes.jpg', inSeason: true },
      { name: 'Yam', description: 'Fresh yam', image: 'https://example.com/yam.jpg', inSeason: true },
      { name: 'Plantain', description: 'Ripe plantain', image: 'https://example.com/plantain.jpg', inSeason: true },
    ];

    const createdProducts = [];
    const createdProductOptions = [];

    for (const productData of sampleProducts) {
      const product = await Product.create({
        ...productData,
        createdBy: 'seed-script',
        updatedBy: 'seed-script',
        deletedAt: null
      });

      // Create 2-3 product options for each product
      const numOptions = Math.floor(Math.random() * 2) + 2; // 2 or 3 options
      for (let i = 0; i < numOptions; i++) {
        const optionNames = ['Small', 'Medium', 'Large', '1kg', '2kg', '5kg', '10kg'];
        const optionName = optionNames[Math.floor(Math.random() * optionNames.length)];
        const price = Math.floor(Math.random() * 5000) + 500; // Random price between 500 and 5500
        const stock = Math.floor(Math.random() * 100) + 10;

        const productOption = await ProductOption.create({
          productId: product._id,
          name: `${product.name} - ${optionName}`,
          price,
          image: product.image,
          stock,
          createdBy: 'seed-script',
          updatedBy: 'seed-script',
          deletedAt: null
        });

        createdProductOptions.push(productOption);
      }

      createdProducts.push(product);
    }

    console.log(`Created ${createdProducts.length} products with ${createdProductOptions.length} product options`);
    return { products: createdProducts, productOptions: createdProductOptions };
  }

  // Get all product options for existing products
  const productOptions = await ProductOption.find({ deletedAt: null });
  console.log(`Found ${existingProducts.length} existing products with ${productOptions.length} product options`);
  
  return { products: existingProducts, productOptions };
}

async function ensureLocationsExist(): Promise<any[]> {
  // Check if locations exist
  const existingLocations = await Location.find().limit(10);
  
  if (existingLocations.length === 0) {
    console.log('No locations found. Creating sample locations...');
    
    // Create sample locations (Nigerian states/cities)
    const locationNames = [
      'Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 
      'Benin City', 'Kaduna', 'Aba', 'Maiduguri', 'Ilorin'
    ];

    const createdLocations = [];
    for (const name of locationNames) {
      const location = await Location.create({ name });
      createdLocations.push(location);
    }

    console.log(`Created ${createdLocations.length} locations`);
    return createdLocations;
  }

  console.log(`Found ${existingLocations.length} existing locations`);
  return existingLocations;
}

// Generate random date within a specific month of the current year
function randomDateInMonth(year: number, month: number): Date {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return new Date(year, month, day, hour, minute);
}

async function seed() {
  try {
    console.log('Starting seed process...');
    
    // Connect to database
    await connectDB();
    
    // Ensure locations exist
    const locations = await ensureLocationsExist();
    if (locations.length === 0) {
      console.error('No locations available. Cannot assign locationId to users.');
      process.exit(1);
    }
    
    // Ensure products exist
    const { products, productOptions } = await ensureProductsExist();
    
    if (productOptions.length === 0) {
      console.error('No product options available. Cannot create orders.');
      process.exit(1);
    }

    // Hash password once
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(PASSWORD, saltRounds);
    console.log('Password hashed successfully');

    // Create users
    console.log(`Creating ${NUM_USERS} users...`);
    const users = [];
    
    for (let i = 0; i < NUM_USERS; i++) {
      const firstname = firstNames[i % firstNames.length];
      const lastname = lastNames[i % lastNames.length];
      const email = generateEmail(firstname, lastname, i);
      const phone = generatePhoneNumber(i);
      const username = generateUsername(firstname, lastname, i);

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }, { username }],
        deletedAt: null 
      });

      if (existingUser) {
        console.log(`User ${email} already exists, skipping...`);
        // Assign locationId if user doesn't have one
        if (!existingUser.locationId) {
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          await User.updateOne({ _id: existingUser._id }, { $set: { locationId: randomLocation._id } });
          existingUser.locationId = randomLocation._id;
        }
        users.push(existingUser);
        continue;
      }

      // Assign random location to new user
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];

      const user = await User.create({
        firstname,
        lastname,
        email: email.toLowerCase(),
        phone,
        username,
        verified: true,
        locationId: randomLocation._id,
        deletedAt: null
      });

      await UserAuth.create({
        userId: user._id,
        password: hashedPassword
      });

      users.push(user);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Created ${i + 1}/${NUM_USERS} users...`);
      }
    }

    console.log(`Created ${users.length} users successfully`);

    // Create orders for each user
    console.log(`Creating ${ORDERS_PER_USER} orders for each user...`);
    const totalOrders = users.length * ORDERS_PER_USER;
    let orderCount = 0;

    // Date range: 3 years back to now
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 3);

    for (const user of users) {
      for (let i = 0; i < ORDERS_PER_USER; i++) {
        // Random order date within the range
        const orderDate = randomDate(startDate, endDate);
        
        // Random status (weighted towards more common statuses)
        const statusWeights = [0.4, 0.4, 0.2]; // PENDING, DELIVERED, PAID
        const random = Math.random();
        let cumulative = 0;
        let status: OrderStatus = 'PENDING';
        for (let j = 0; j < orderStatuses.length; j++) {
          cumulative += statusWeights[j];
          if (random <= cumulative) {
            status = orderStatuses[j];
            break;
          }
        }

        // Random payment method
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Random state
        const state = states[Math.floor(Math.random() * states.length)];

        // Create order
        const order = await Order.create({
          userId: user._id,
          status,
          address: `${Math.floor(Math.random() * 999) + 1} Sample Street`,
          state,
          email: user.email,
          phone: user.phone,
          firstname: user.firstname,
          lastname: user.lastname,
          total: 0, // Will be calculated from order products
          delivery: Math.floor(Math.random() * 2000) + 500, // Random delivery fee between 500 and 2500
          paymentMethod
        });

        // Backdate timestamps using updateOne to bypass Mongoose timestamp handling
        await Order.updateOne(
          { _id: order._id },
          { 
            $set: { 
              createdAt: orderDate,
              updatedAt: orderDate
            }
          }
        );

        // Create order products (1-5 products per order)
        const numProducts = Math.floor(Math.random() * 5) + 1; // 1 to 5 products
        let orderTotal = 0;

        // Select random product options
        const selectedOptions: typeof productOptions = [];
        for (let j = 0; j < numProducts; j++) {
          const randomOption = productOptions[Math.floor(Math.random() * productOptions.length)];
          // Avoid duplicates in same order
          if (!selectedOptions.find(opt => opt._id.toString() === randomOption._id.toString())) {
            selectedOptions.push(randomOption);
          }
        }

        for (const productOption of selectedOptions) {
          const quantity = Math.floor(Math.random() * 5) + 1; // 1 to 5 quantity
          const price = productOption.price;
          const subtotal = price * quantity;

          const orderProduct = await OrderProduct.create({
            orderId: order._id,
            userId: user._id,
            productId: productOption.productId,
            productOptionId: productOption._id,
            quantity,
            price
          });

          // Backdate OrderProduct timestamps
          await OrderProduct.updateOne(
            { _id: orderProduct._id },
            {
              $set: {
                createdAt: orderDate,
                updatedAt: orderDate
              }
            }
          );

          orderTotal += subtotal;
        }

        // Update order total and maintain backdated timestamp
        await Order.updateOne(
          { _id: order._id },
          { 
            $set: { 
              total: orderTotal + order.delivery,
              updatedAt: orderDate
            }
          }
        );

        orderCount++;
        
        if (orderCount % 100 === 0) {
          console.log(`Created ${orderCount}/${totalOrders} orders...`);
        }
      }
    }

    // Assign locationId to any users that don't have one
    console.log('Assigning locationId to users without one...');
    const usersWithoutLocation = await User.find({ locationId: null, deletedAt: null });
    for (const user of usersWithoutLocation) {
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      await User.updateOne({ _id: user._id }, { $set: { locationId: randomLocation._id } });
    }
    if (usersWithoutLocation.length > 0) {
      console.log(`Assigned locationId to ${usersWithoutLocation.length} existing users`);
    }

    // Add 1000 more orders for this year, spread across months
    console.log(`\nAdding ${ADDITIONAL_ORDERS_THIS_YEAR} orders for this year, spread across months...`);
    const currentYear = new Date().getFullYear();
    const ordersPerMonth = Math.floor(ADDITIONAL_ORDERS_THIS_YEAR / 12);
    const remainingOrders = ADDITIONAL_ORDERS_THIS_YEAR % 12;
    
    let additionalOrderCount = 0;
    for (let month = 0; month < 12; month++) {
      const ordersThisMonth = ordersPerMonth + (month < remainingOrders ? 1 : 0);
      
      for (let i = 0; i < ordersThisMonth; i++) {
        // Random user
        const user = users[Math.floor(Math.random() * users.length)];
        
        // Random date within this month
        const orderDate = randomDateInMonth(currentYear, month);
        
        // Random status
        const statusWeights = [0.15, 0.15, 0.15, 0.15, 0.20, 0.10, 0.10];
        const random = Math.random();
        let cumulative = 0;
        let status: OrderStatus = 'PENDING';
        for (let j = 0; j < orderStatuses.length; j++) {
          cumulative += statusWeights[j];
          if (random <= cumulative) {
            status = orderStatuses[j];
            break;
          }
        }

        // Random payment method
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Random state
        const state = states[Math.floor(Math.random() * states.length)];

        // Create order
        const order = await Order.create({
          userId: user._id,
          status,
          address: `${Math.floor(Math.random() * 999) + 1} Sample Street`,
          state,
          email: user.email,
          phone: user.phone,
          firstname: user.firstname,
          lastname: user.lastname,
          total: 0,
          delivery: Math.floor(Math.random() * 2000) + 500,
          paymentMethod
        });

        // Backdate timestamps
        await Order.updateOne(
          { _id: order._id },
          { 
            $set: { 
              createdAt: orderDate,
              updatedAt: orderDate
            }
          }
        );

        // Create order products (1-5 products per order)
        const numProducts = Math.floor(Math.random() * 5) + 1;
        let orderTotal = 0;

        const selectedOptions: typeof productOptions = [];
        for (let j = 0; j < numProducts; j++) {
          const randomOption = productOptions[Math.floor(Math.random() * productOptions.length)];
          if (!selectedOptions.find(opt => opt._id.toString() === randomOption._id.toString())) {
            selectedOptions.push(randomOption);
          }
        }

        for (const productOption of selectedOptions) {
          const quantity = Math.floor(Math.random() * 5) + 1;
          const price = productOption.price;
          const subtotal = price * quantity;

          const orderProduct = await OrderProduct.create({
            orderId: order._id,
            userId: user._id,
            productId: productOption.productId,
            productOptionId: productOption._id,
            quantity,
            price
          });

          // Backdate OrderProduct timestamps
          await OrderProduct.updateOne(
            { _id: orderProduct._id },
            {
              $set: {
                createdAt: orderDate,
                updatedAt: orderDate
              }
            }
          );

          orderTotal += subtotal;
        }

        // Update order total
        await Order.updateOne(
          { _id: order._id },
          { 
            $set: { 
              total: orderTotal + order.delivery,
              updatedAt: orderDate
            }
          }
        );

        additionalOrderCount++;
      }
      
      const monthName = new Date(currentYear, month, 1).toLocaleString('default', { month: 'long' });
      console.log(`Created ${ordersThisMonth} orders for ${monthName} ${currentYear}`);
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`- Created/Updated ${users.length} users (all with locationId)`);
    console.log(`- Created ${orderCount} orders (backdated across last 3 years)`);
    console.log(`- Created ${additionalOrderCount} additional orders for ${currentYear} (spread across months)`);
    console.log(`- Total orders: ${orderCount + additionalOrderCount}`);
    console.log(`- All users have password: ${PASSWORD}`);

    process.exit(0);
  } catch (error: any) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

// Run seed
seed();

