export const shopInfo = {
  name: 'STM Salam',
  tagline: "Authentic Kopitiam Flavors, Delivered.",
  address: 'Blk 55 Marine Terrace, #01-303, Singapore 440055',
  phone: '+65 9191 5766',
  whatsapp: '+65 9191 5766',
  email: 'highlitesg786@gmail.com',
  website: 'https://www.stmsalam.com',
  catalog: 'https://wa.me/c/6591915766',
  hours: 'Daily 9:00 AM – 11:00 PM',
  deliveryFee: 2.00,
  minOrder: 10.00,
  avgDeliveryTime: '25–35 min',
}

export const categories = [
  { id: 'hot-drinks', name: 'Hot Drinks', emoji: '☕' },
  { id: 'cold-drinks', name: 'Cold Drinks', emoji: '🧊' },
  { id: 'can-drinks', name: 'Can Drinks', emoji: '🥫' },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋' },
  { id: 'dinosaur', name: 'Dinosaur', emoji: '🦕' },
  { id: 'burgers-kebabs', name: 'Burgers, Kebabs & More', emoji: '🍔' },
  { id: 'snacks', name: 'Snacks', emoji: '🥟' },
  { id: 'sides', name: 'Sides', emoji: '🍟' },
  { id: 'desserts', name: 'Desserts', emoji: '🍰' },
  { id: 'indian', name: 'Indian Food', emoji: '🍛', note: 'Start 9:00 AM to 9:00 PM' },
]

export const menuItems = [
  // ─── HOT DRINKS ───
  { id: 1, category: 'hot-drinks', name: 'Ginger Tea', price: 2.00, description: 'Traditional warming ginger tea brewed fresh.', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400', badge: 'bestseller' },
  { id: 2, category: 'hot-drinks', name: 'Horlicks Hot', price: 2.50, description: 'Classic hot Horlicks – the comfort drink.', img: 'https://images.unsplash.com/photo-1553906982-d46921b021d7?auto=format&fit=crop&w=400', badge: null },
  { id: 3, category: 'hot-drinks', name: 'Teh O', price: 1.80, description: 'Black tea with sugar, no milk.', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400', badge: null },

  // ─── COLD DRINKS ───
  { id: 10, category: 'cold-drinks', name: 'Kopi C Kosong Ice', price: 2.50, description: 'Iced coffee with evaporated milk, no sugar.', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 11, category: 'cold-drinks', name: 'Honey Lemon Ice', price: 3.00, description: 'Honey and fresh lemon over ice.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400', badge: null },
  { id: 12, category: 'cold-drinks', name: 'Teh Ginger Ice', price: 2.80, description: 'Iced ginger tea – refreshing and spicy.', img: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=400', badge: null },

  // ─── CAN DRINKS ───
  { id: 20, category: 'can-drinks', name: 'Dasani Water', price: 1.50, description: 'Pure drinking water.', img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400', badge: null },
  { id: 21, category: 'can-drinks', name: 'KICKAPOO', price: 2.00, description: 'Classic citrus carbonated drink.', img: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=400', badge: null },
  { id: 22, category: 'can-drinks', name: 'Chrysanthemum Tea', price: 2.00, description: 'Sweet chrysanthemum flower tea.', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400', badge: null },

  // ─── SUGARCANE ───
  { id: 30, category: 'sugarcane', name: 'Fresh Sugarcane, Lemon No Ice', price: 3.50, description: 'Freshly pressed sugarcane with a squeeze of lemon.', img: 'https://images.unsplash.com/photo-1596461404969-9ae70fc2975c?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 31, category: 'sugarcane', name: 'Fresh Sugarcane, Less Ice with Lemon', price: 3.50, description: 'Less ice, more sugarcane goodness with lemon.', img: 'https://images.unsplash.com/photo-1596461404969-9ae70fc2975c?auto=format&fit=crop&w=400', badge: null },
  { id: 32, category: 'sugarcane', name: 'Fresh Sugarcane Asam Ice', price: 3.80, description: 'Sugarcane with asam (tamarind) – tangy & sweet.', img: 'https://images.unsplash.com/photo-1596461404969-9ae70fc2975c?auto=format&fit=crop&w=400', badge: null },

  // ─── DINOSAUR ───
  { id: 40, category: 'dinosaur', name: 'Milo Dino ICE', price: 3.50, description: 'Iced Milo topped with Milo powder — the legendary dino.', img: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 41, category: 'dinosaur', name: 'Bandung Dinosaur', price: 3.80, description: 'Rose syrup milk topped with extra powder.', img: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=400', badge: null },
  { id: 42, category: 'dinosaur', name: 'Horlicks Dinosaur Ice', price: 3.80, description: 'Iced Horlicks with extra Horlicks powder on top.', img: 'https://images.unsplash.com/photo-1553906982-d46921b021d7?auto=format&fit=crop&w=400', badge: null },

  // ─── BURGERS, KEBABS & MORE ───
  { id: 50, category: 'burgers-kebabs', name: 'LAMB BURGER CLASSIC', price: 10.00, description: 'Juicy lamb patty with fresh veggies in a brioche bun.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 51, category: 'burgers-kebabs', name: 'Hummus Falafel (Tortilla)', price: 8.50, description: 'Crispy falafel with creamy hummus in a tortilla wrap.', img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400', badge: null },
  { id: 52, category: 'burgers-kebabs', name: 'Chicken Burger Classic', price: 8.00, description: 'Grilled chicken breast on a toasted brioche bun.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400', badge: null },

  // ─── SNACKS ───
  { id: 60, category: 'snacks', name: 'Roti Curry 1 Piece', price: 2.00, description: 'Flaky roti with savory curry dip.', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400', badge: null },
  { id: 61, category: 'snacks', name: '7 DAYS 1 Piece', price: 1.50, description: 'Classic 7 Days croissant snack.', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?auto=format&fit=crop&w=400', badge: null },
  { id: 62, category: 'snacks', name: 'Bhai Suji', price: 3.00, description: 'Traditional Indian semolina snack.', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400', badge: 'bestseller' },

  // ─── SIDES ───
  { id: 70, category: 'sides', name: 'ONION RINGS', price: 5.00, description: 'Golden crispy onion rings.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400', badge: null },
  { id: 71, category: 'sides', name: 'French Fries', price: 4.00, description: 'Classic golden french fries.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 72, category: 'sides', name: 'Cheese Fries', price: 5.50, description: 'Fries topped with melted cheese sauce.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400', badge: null },

  // ─── DESSERTS ───
  { id: 80, category: 'desserts', name: 'KUNAFA ORIGINAL', price: 6.00, description: 'Crunchy kunafa with cream cheese filling.', img: 'https://images.unsplash.com/photo-1518176258439-d3dd5480ba01?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 81, category: 'desserts', name: 'KUNAFA NUTELLA', price: 7.00, description: 'Kunafa drizzled with rich Nutella.', img: 'https://images.unsplash.com/photo-1518176258439-d3dd5480ba01?auto=format&fit=crop&w=400', badge: 'new' },

  // ─── INDIAN FOOD (9AM–9PM) ───
  { id: 90, category: 'indian', name: 'Mutton Biryani', price: 9.00, description: 'Fragrant basmati rice with tender mutton.', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400', badge: 'bestseller' },
  { id: 91, category: 'indian', name: 'PRATA TELUR', price: 2.50, description: 'Crispy prata with egg – a local classic.', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400', badge: null },
  { id: 92, category: 'indian', name: 'MURTABAK (MUTTON)', price: 7.00, description: 'Stuffed pancake with spiced mutton.', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400', badge: 'bestseller' },
]

export const testimonials = [
  { id: 1, name: 'Zaki R.', rating: 5, text: 'The mutton biryani is world-class. Authentic taste every time.' },
  { id: 2, name: 'Sarah L.', rating: 5, text: 'Fast delivery to Marine Terrace. The Milo Dino is huge!' },
  { id: 3, name: 'Farhan M.', rating: 5, text: 'Cleanest kopitiam food in Singapore. Highly recommend the kebabs.' },
]

export const promos = [
  { id: 1, code: 'STMSALAM2', title: '$2 OFF first order', subtitle: 'Welcome to STM Salam', color: '#013220' },
]

export const outlets = [
  { id: 1, name: 'STM Salam @ Marine Terrace', address: 'Blk 55 Marine Terrace, #01-303, Singapore 440055', phone: '+65 9191 5766', hours: '9:00 AM - 11:00 PM', isMain: true, img: '/bg1.jpeg' },
]
