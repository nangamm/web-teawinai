const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Category = require('../models/Category');
const Place = require('../models/Place');
const User = require('../models/User');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teawinai');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Place.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const categories = await Category.create([
      {
        name: 'วัด',
        icon: '🏛️',
        description: 'สถานที่ทางศาสนาและประวัติศาสตร์'
      },
      {
        name: 'คาเฟ่',
        icon: '☕',
        description: 'ร้านกาแฟและขนม'
      },
      {
        name: 'ร้านอาหาร',
        icon: '🍜',
        description: 'ร้านอาหารต่างๆ'
      },
      {
        name: 'สวนสาธารณะ',
        icon: '🌳',
        description: 'สถานที่พักผ่อนและท่องเที่ยวเชิงธรรมชาติ'
      }
    ]);

    console.log(`Created ${categories.length} categories`);

    // Create category mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin1234', 12);
    const ownerPassword = await bcrypt.hash('Owner1234', 12);
    const userPassword = await bcrypt.hash('User1234', 12);

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@teawinai.com',
        password_hash: adminPassword,
        role: 'admin',
        phone: '0812345678'
      },
      {
        name: 'Owner User',
        email: 'owner@teawinai.com',
        password_hash: ownerPassword,
        role: 'owner',
        phone: '0823456789'
      },
      {
        name: 'Regular User',
        email: 'user@teawinai.com',
        password_hash: userPassword,
        role: 'user',
        phone: '0834567890'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create places
    const places = [
      {
        name: 'วัดพระธาตุหนองบัว',
        category: categoryMap['วัด'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2633,104.8390',
        lat: 15.2633,
        lng: 104.8390,
        price_min: 0,
        price_max: 0,
        is_free: true,
        rating: 4.7,
        image_url: '',
        open_time: '08:00',
        close_time: '17:00',
        status: 'active',
        submitted_by: users[0]._id // admin
      },
      {
        name: 'วัดทุ่งศรีเมือง',
        category: categoryMap['วัด'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2300,104.8612',
        lat: 15.2300,
        lng: 104.8612,
        price_min: 0,
        price_max: 0,
        is_free: true,
        rating: 4.4,
        image_url: '',
        open_time: '08:00',
        close_time: '17:00',
        status: 'active',
        submitted_by: users[0]._id // admin
      },
      {
        name: 'ทุ่งศรีเมือง',
        category: categoryMap['สวนสาธารณะ'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2302,104.8573',
        lat: 15.2302,
        lng: 104.8573,
        price_min: 0,
        price_max: 0,
        is_free: true,
        rating: 4.5,
        image_url: '',
        open_time: '06:00',
        close_time: '18:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      },
      {
        name: 'พิพิธภัณฑสถานแห่งชาติอุบลฯ',
        category: categoryMap['สวนสาธารณะ'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2278,104.8576',
        lat: 15.2278,
        lng: 104.8576,
        price_min: 30,
        price_max: 30,
        rating: 4.6,
        image_url: '',
        open_time: '09:00',
        close_time: '16:00',
        status: 'active',
        submitted_by: users[0]._id // admin
      },
      {
        name: 'หาดคูเดื่อ',
        category: categoryMap['สวนสาธารณะ'],
        address: 'ตำบลคูเดื่อ อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2111,104.7935',
        lat: 15.2111,
        lng: 104.7935,
        price_min: 0,
        price_max: 0,
        is_free: true,
        rating: 4.3,
        image_url: '',
        open_time: '06:00',
        close_time: '18:00',
        status: 'active',
        submitted_by: users[2]._id // user
      },
      {
        name: 'Long Lux Coffee Roasters',
        category: categoryMap['คาเฟ่'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2206,104.8609',
        lat: 15.2206,
        lng: 104.8609,
        price_min: 60,
        price_max: 120,
        rating: 4.6,
        image_url: '',
        open_time: '08:00',
        close_time: '20:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      },
      {
        name: 'Normal UBON',
        category: categoryMap['คาเฟ่'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2269,104.8603',
        lat: 15.2269,
        lng: 104.8603,
        price_min: 60,
        price_max: 90,
        rating: 4.8,
        image_url: '',
        open_time: '07:00',
        close_time: '21:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      },
      {
        name: 'GODFATHER COFFEE',
        category: categoryMap['คาเฟ่'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2344,104.8485',
        lat: 15.2344,
        lng: 104.8485,
        price_min: 80,
        price_max: 150,
        rating: 4.8,
        image_url: '',
        open_time: '07:00',
        close_time: '22:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      },
      {
        name: 'Wab Cafe',
        category: categoryMap['คาเฟ่'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2269,104.8614',
        lat: 15.2269,
        lng: 104.8614,
        price_min: 60,
        price_max: 120,
        rating: 4.8,
        image_url: '',
        open_time: '08:00',
        close_time: '20:00',
        status: 'active',
        submitted_by: users[2]._id // user
      },
      {
        name: 'Arabus Experience Cafe',
        category: categoryMap['คาเฟ่'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2276,104.8591',
        lat: 15.2276,
        lng: 104.8591,
        price_min: 60,
        price_max: 100,
        rating: 5.0,
        image_url: '',
        open_time: '08:00',
        close_time: '20:00',
        status: 'active',
        submitted_by: users[2]._id // user
      },
      {
        name: 'ต้มกระเทยอุบลฯ',
        category: categoryMap['ร้านอาหาร'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2378,104.8625',
        lat: 15.2378,
        lng: 104.8625,
        price_min: 60,
        price_max: 150,
        rating: 4.4,
        image_url: '',
        open_time: '10:00',
        close_time: '21:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      },
      {
        name: 'Santi Restaurant',
        category: categoryMap['ร้านอาหาร'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2335,104.8466',
        lat: 15.2335,
        lng: 104.8466,
        price_min: 80,
        price_max: 200,
        rating: 4.3,
        image_url: '',
        open_time: '11:00',
        close_time: '22:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      },
      {
        name: 'Nuehom Restaurant',
        category: categoryMap['ร้านอาหาร'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2242,104.8614',
        lat: 15.2242,
        lng: 104.8614,
        price_min: 80,
        price_max: 200,
        rating: 4.4,
        image_url: '',
        open_time: '11:00',
        close_time: '21:00',
        status: 'active',
        submitted_by: users[2]._id // user
      },
      {
        name: 'View Mun',
        category: categoryMap['ร้านอาหาร'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2195,104.8150',
        lat: 15.2195,
        lng: 104.8150,
        price_min: 100,
        price_max: 250,
        rating: 4.5,
        image_url: '',
        open_time: '11:00',
        close_time: '22:00',
        status: 'active',
        submitted_by: users[2]._id // user
      },
      {
        name: 'MADELA',
        category: categoryMap['ร้านอาหาร'],
        address: 'ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี',
        map_link: 'https://maps.google.com/?q=15.2325,104.8553',
        lat: 15.2325,
        lng: 104.8553,
        price_min: 150,
        price_max: 400,
        rating: 4.9,
        image_url: '',
        open_time: '11:00',
        close_time: '22:00',
        status: 'active',
        submitted_by: users[1]._id // owner
      }
    ];

    const createdPlaces = await Place.insertMany(places);
    console.log(`Created ${createdPlaces.length} places`);

    console.log('\n=== Seed Data Summary ===');
    console.log(`Categories: ${categories.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Places: ${createdPlaces.length}`);
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@teawinai.com / Admin1234');
    console.log('Owner: owner@teawinai.com / Owner1234');
    console.log('User: user@teawinai.com / User1234');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seed function
seedData();
