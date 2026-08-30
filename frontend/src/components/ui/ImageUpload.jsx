import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/api';
import { FiUpload, FiX } from 'react-icons/fi';

export default function ImageUpload({ images = [], onChange, folder = 'products', multiple = true }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post(`/upload/image?folder=${folder}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        urls.push(data.data.url);
      }
      onChange(multiple ? [...images, ...urls] : [urls[0]]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
        <FiUpload className="text-gray-400" />
        <span className="text-sm text-gray-500">
          {uploading ? t('common.loading') : t('products.uploadImages')}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
