import api from './axios';

// upload single image
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// upload multiple images
export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// delete image
export const deleteImage = async (publicId) => {
  const response = await api.delete('/upload/image', {
    data: { publicId }
  });
  return response.data;
};
