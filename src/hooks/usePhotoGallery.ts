import {useState, useEffect, FC} from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { CameraResultType, CameraSource, CameraPhoto, Capacitor, FilesystemDirectory } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";

export type Photo = {
  filepath: string;
  webviewPath?: string;
}

export const usePhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileName = `${new Date().getTime()}.jpg`;

  const { getPhoto } = useCamera();

  const savePicture = async (photo: CameraPhoto, fileName: string) :Promise<Photo> => {
    const base64Data = await base64FromPath(photo.webPath!);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    }
  }

  const takePhoto = async () => {
    const cameraPhoto: CameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos = [savedFileImage, ...photos];
    setPhotos(newPhotos);
  }

  return { photos, takePhoto };
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('method did not return a string')
      }
    };
    reader.readAsDataURL(blob);
  });
}
