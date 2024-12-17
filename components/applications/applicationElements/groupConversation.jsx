"use client";
import React, { useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const GroupConversationForm = ({
  groupName,
  setGroupName,
  file,
  croppedImage,
  handleImageChange,
  handleImageDelete,
  handleCrop,
  uploading,
  onCreateGroup,
  loading
}) => {
  const cropperRef = useRef(null);
  const [isCropped, setIsCropped] = useState(false);

  const handleImageCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const cropper = cropperRef.current.cropper;
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 200,
        height: 200,
      });
  
      if (croppedCanvas) {
       
        // Circular Crop Logic
        const canvas = document.createElement("canvas");
        const size = Math.min(croppedCanvas.width, croppedCanvas.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
  
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
  
        ctx.drawImage(
          croppedCanvas,
          (croppedCanvas.width - size) / 2,
          (croppedCanvas.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );
  
        const dataURL = canvas.toDataURL();
       
  
        handleCrop(dataURL); // Pass circular cropped image data to parent
        setIsCropped(true);
      } else {
        console.error("getCroppedCanvas failed. Check cropper instance.");
      }
    }
  };
  

  

  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
      {/* Group Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Group Name
        </label>
        <input
          type="text"
          placeholder="Enter Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring focus:ring-blue-300 focus:outline-none"
        />
      </div>

      {/* Image Upload Section */}
      <div className="p-4 bg-gray-50 border rounded-md">
        <h2 className="text-md font-semibold text-gray-700 mb-4">
          Upload and Crop Group Image
        </h2>
        <label className="inline-flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
          <span>Choose Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {file && !isCropped && (
          <div className="mt-4">
            {/* Cropper Component */}
            <Cropper
              src={file}
              style={{ height: 300, width: "100%" }}
              initialAspectRatio={1}
              aspectRatio={1}
              guides={false}
              ref={cropperRef}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleImageCrop}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Crop Image
              </button>
            </div>
          </div>
        )}

        {croppedImage && isCropped && (
          <div className="mt-4 text-center">
            <img
              src={croppedImage}
              alt="Cropped Group Icon"
              className="w-20 h-20 rounded-full object-cover mx-auto border"
            />
            <button
              onClick={handleImageDelete}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              {loading ? "Deleting..." : "Delete Image"}
            </button>
          </div>
        )}

        {!file && (
          <p className="mt-4 text-sm text-gray-500">
            Please upload an image to get started.
          </p>
        )}
      </div>

      {/* Create Group Button */}
      <div className="flex justify-end">
        <button
          onClick={onCreateGroup}
          className={`px-6 py-2 rounded-md font-medium transition ${
            uploading
              ? "bg-gray-400 cursor-not-allowed text-gray-700"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={uploading}
        >
          {uploading ? "Creating..." : "Create Group & Message"}
        </button>
      </div>
    </div>
  );
};

export default GroupConversationForm;
