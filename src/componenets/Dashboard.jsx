import React, { useState, useEffect } from 'react';

const DishCard = ({ dish, onTogglePublish }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-48 object-cover rounded" />
    <h2 className="mt-2 text-xl font-bold">{dish.dishName}</h2>
    <p>ID: {dish.dishId}</p>
    <button 
      onClick={() => onTogglePublish(dish.dishId)}
      className={`mt-2 px-4 py-2 rounded ${dish.isPublished ? 'bg-red-500' : 'bg-green-500'} text-white`}
    >
      {dish.isPublished ? 'Unpublish' : 'Publish'}
    </button>
  </div>
);

const Dashboard = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetch('http://localhost:3000/dishes');
      const data = await response.json();
      // Ensure isPublished is a boolean
      const formattedData = data.map(dish => ({
        ...dish,
        isPublished: Boolean(dish.isPublished)
      }));
      setDishes(formattedData);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const togglePublish = async (dishId) => {
    try {
      await fetch(`http://localhost:3000/toggle-publish/${dishId}`, { method: 'POST' });
      fetchDishes();  // Refetch to update the UI
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dish Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes.map(dish => (
          <DishCard key={dish.dishId} dish={dish} onTogglePublish={togglePublish} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;