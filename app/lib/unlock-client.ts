import { PDFDocument } from "pdf-lib";

const PDFJS_VERSION = "3.11.174";
type ProgressUpdater = (progress: number, step: string) => void;

let pdfJsLoader: Promise<any> | null = null;

const loadPdfJs = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF.js can only be loaded in the browser."));
  }

  if ((window as any).pdfjsLib) {
    return Promise.resolve((window as any).pdfjsLib);
  }

  if (!pdfJsLoader) {
    pdfJsLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error("PDF.js failed to load."));
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js from CDN."));
      document.head.appendChild(script);
    });
  }

  return pdfJsLoader;
};

const dataUrlToUint8Array = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const buildPasswordError = () =>
  new Error("Incorrect password. Please verify and try again.");

const loadEncryptedPdf = async (
  pdfjsLib: any,
  data: Uint8Array,
  password: string
) => {
  const passwordError = buildPasswordError();
  const loadingTask = pdfjsLib.getDocument({
    data,
    password,
    passwordCallback: (_verifyPassword: (pwd: string) => void, reason: number) => {
      if (reason === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
        _verifyPassword(password);
        return;
      }

      throw passwordError;
    },
  });

  try {
    return await loadingTask.promise;
  } catch (error: any) {
    if (
      error === passwordError ||
      error?.name === "PasswordException" ||
      /password/gi.test(error?.message || "")
    ) {
      throw passwordError;
    }
    throw error;
  }
};

export const unlockPdfInBrowser = async (
  file: File,
  password: string,
  updateProgress?: ProgressUpdater
) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await loadPdfJs();
  updateProgress?.(30, "Decrypting PDF...");

  let pdfDocument;
  try {
    pdfDocument = await loadEncryptedPdf(
      pdfjsLib,
      new Uint8Array(arrayBuffer),
      password
    );
  } catch (error: any) {
    if (error?.message) {
      throw error;
    }
    throw new Error(
      error?.message || "Unable to open the encrypted PDF with the provided password."
    );
  }

  const pdfDoc = await PDFDocument.create();
  const totalPages = pdfDocument.numPages;

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    updateProgress?.(
      30 + Math.round((pageNumber / totalPages) * 50),
      `Rendering page ${pageNumber} of ${totalPages}...`
    );

    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas rendering is not supported in this environment.");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderTask = page.render({ canvasContext: context, viewport });
    await renderTask.promise;

    const imgData = canvas.toDataURL("image/png");
    const imageBytes = await dataUrlToUint8Array(imgData);
    const embeddedImage = await pdfDoc.embedPng(imageBytes);
    const pdfPage = pdfDoc.addPage([viewport.width, viewport.height]);

    pdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  updateProgress?.(90, "Preparing unlocked PDF...");
  const unlockedBytes = await pdfDoc.save();
  updateProgress?.(100, "Complete!");

  return new Blob([unlockedBytes], { type: "application/pdf" });
};
