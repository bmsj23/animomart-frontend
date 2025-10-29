// shared category data used across the application
export const CATEGORY_DATA = [
  {
    name: 'School Supplies',
    subcategories: ['Notebooks', 'Pens & Pencils', 'Paper', 'Binders', 'Other Supplies'],
    image: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&q=80',
    description: 'Everything you need for your academic journey'
  },
  {
    name: 'Electronics',
    subcategories: ['Laptops', 'Phones', 'Accessories', 'Chargers', 'Other Electronics'],
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    description: 'Latest tech and gadgets for students'
  },
  {
    name: 'Books',
    subcategories: ['Textbooks', 'Novels', 'Study Guides', 'Reference', 'Other Books'],
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80',
    description: 'Textbooks, novels, and learning materials'
  },
  {
    name: 'Clothing',
    subcategories: ['Shirts', 'Pants', 'Shoes', 'Other Clothing'],
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
    description: 'Campus fashion and everyday wear'
  },
  {
    name: 'Food & Beverages',
    subcategories: ['Snacks', 'Drinks', 'Meal Prep', 'Other Food'],
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80',
    description: 'Snacks and drinks for busy students'
  },
  {
    name: 'Sports Equipment',
    subcategories: ['Gym Equipment', 'Sports Gear', 'Outdoor', 'Other Sports'],
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    description: 'Gear for fitness and sports activities'
  },
  {
    name: 'Others',
    subcategories: [],
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    description: 'Miscellaneous items and more'
  }
];

// get all categories (main categories only)
export const getAllCategories = () => CATEGORY_DATA.map(cat => cat.name);

// get all categories including subcategories (flat array for backend validation)
export const getAllCategoriesFlat = () => {
  const categories = [];
  CATEGORY_DATA.forEach(cat => {
    categories.push(cat.name);
    categories.push(...cat.subcategories);
  });
  return categories;
};

// get subcategories for a specific main category
export const getSubcategories = (categoryName) => {
  const category = CATEGORY_DATA.find(cat => cat.name === categoryName);
  return category ? category.subcategories : [];
};

// check if a category is a main category
export const isMainCategory = (categoryName) => {
  return CATEGORY_DATA.some(cat => cat.name === categoryName);
};

// check if a category is a subcategory
export const isSubcategory = (categoryName) => {
  return CATEGORY_DATA.some(cat => cat.subcategories.includes(categoryName));
};

// get parent category for a subcategory
export const getParentCategory = (subcategoryName) => {
  const parent = CATEGORY_DATA.find(cat => cat.subcategories.includes(subcategoryName));
  return parent ? parent.name : null;
};

// get category data by name (returns full category object)
export const getCategoryData = (categoryName) => {
  return CATEGORY_DATA.find(cat => cat.name === categoryName);
};