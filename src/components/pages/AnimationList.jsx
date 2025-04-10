import React, { useEffect, useState } from 'react';
import { getAllAnimations } from '../Service/Api';
import LOGO from '../../assets/img/logo.jpg';
const AnimationList = () => {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        const data = await getAllAnimations();
        setAnimations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnimations();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const getEmbedUrl = (url) => {
    const fileId = url.match(/\/d\/(.+?)\/view/)[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {animations.map((animation) => (
        <div
          key={animation.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800">{animation.title}</h2>
          <p className="text-gray-600">Year: {animation.releaseYear}</p>
          <p className="text-gray-600">Description: {animation.description}</p>
          <p className="text-gray-600">3D: {animation.is3d ? 'Yes' : 'No'}</p>
          <p className="text-gray-600">Director: {animation.director.name}</p>
          <p className="text-gray-600">Genre: {animation.genre.name}</p>
          <p className="text-gray-600">Studio: {animation.studio.name}</p>
          <div className="mt-2 relative">
            <iframe
              src={getEmbedUrl(animation.videoUrl)}
              width="100%"
              height="300"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="rounded-md"
              title={animation.title}
            ></iframe>

            <div
              className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center"
              style={{ pointerEvents: 'auto' }}
            >
              <img
                src={LOGO}
                alt="Block Icon"
                className="w-10 h-10 rounded-lg"
              />
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default AnimationList;