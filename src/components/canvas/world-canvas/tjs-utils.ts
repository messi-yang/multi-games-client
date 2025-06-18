import * as THREE from 'three';
import { TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';

export const createTextMesh = (
  font: Font,
  text: string,
  x: number,
  y: number,
  z: number
): THREE.Mesh<TextGeometry, THREE.MeshBasicMaterial> => {
  const params: TextGeometryParameters = {
    font,
    size: 0.34,
    height: 0.05,
  };
  const textGeometry = new TextGeometry(text, params);
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  textGeometry.computeBoundingBox();
  textGeometry.center();
  textMesh.position.set(x, y, z);
  textMesh.rotation.set(-Math.PI / 6, 0, 0);

  return textMesh;
};
