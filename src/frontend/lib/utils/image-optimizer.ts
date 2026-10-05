/**
 * Tiện ích tối ưu hóa ảnh tự động trên trình duyệt:
 * - Tự động giảm độ phân giải xuống kích thước hiển thị tối ưu (Max dimension 1600px).
 * - Chuyển đổi định dạng sang WebP hiện đại với mức nén chất lượng cao.
 * - Giảm dung lượng từ 5MB - 10MB xuống còn 100KB - 300KB mà vẫn sắc nét chuẩn HD.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  previewUrl: string;
}

export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<CompressionResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước thu gọn theo tỷ lệ
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không thể khởi tạo Canvas 2D context"));
          return;
        }

        // Vẽ ảnh lên canvas với chất lượng làm mịn cao
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Chuyển đổi sang WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Lỗi khi nén ảnh sang WebP"));
              return;
            }

            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              ratio: Math.max(0, ratio),
              previewUrl,
            });
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Không thể đọc tệp hình ảnh"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi khi tải tệp ảnh"));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
