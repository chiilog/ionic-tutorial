import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

export type UserPhoto = {
  filepath: string;
  webviewPath?: string;
};

export const usePhotoGallery = () => {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  const takePhoto = async () => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = `${new Date().getTime()}.jpeg`;
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos: UserPhoto[] = [savedFileImage, ...photos];
    setPhotos(newPhotos);
  };

  const savePicture = async (
    photo: Photo,
    fileName: string
  ): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webPath!);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  };

  return { photos, takePhoto };
};

export const base64FromPath = async (path: string): Promise<string> => {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("method did not return a string");
      }
    };
    reader.readAsDataURL(blob);
  });
};
