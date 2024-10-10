import { IProduct, NewProductDTO } from '@/api/dtos/productDTO';
import { addProductAPI } from '@/api/product';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ALL_CATEGORY_ID, categories } from '@/constants';
import { createNewProduct, initialProductState } from '@/helpers/product';
import { useStore } from '@/store';
import { useProductStore } from '@/store/product/productStore';
import { uploadImage } from '@/utils/imageUpload';
import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export const ProductRegistrationModal: React.FC<
  ProductRegistrationModalProps
> = ({ isOpen, onClose, onProductAdded }) => {
  const setShowToast = useStore((state) => state.setShowToast);
  const addProducts = useProductStore((state) => state.addProducts);
  const FetchData = async (productData: NewProductDTO) => {
    const newProduct: IProduct = await addProductAPI(productData);
    return newProduct;
  };
  const { data, mutate, error } = useMutation({
    mutationFn: FetchData,
    onSuccess(data) {
      addProducts(data);
    },
  });
  const [product, setProduct] = useState<NewProductDTO>(initialProductState);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setProduct((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!product.image) {
        throw new Error('이미지를 선택해야 합니다.');
      }

      const imageUrl = await uploadImage(product.image as File);
      if (!imageUrl) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const newProduct = createNewProduct(product, imageUrl);
      mutate(newProduct);
      setShowToast(true, 'upload');
      onClose();
      onProductAdded();
    } catch (error) {
      console.error('물품 등록에 실패했습니다.', error);
    }
  };

  const handleCategoryChange = (value: string): void => {
    setProduct((prev) => ({
      ...prev,
      category: { ...prev.category, id: value },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>상품 등록</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            name="title"
            placeholder="상품명"
            onChange={handleChange}
            value={product.title || ''}
          />
          <Input
            name="price"
            type="number"
            placeholder="가격"
            onChange={handleChange}
            value={product.price || ''}
          />
          <Textarea
            name="description"
            className="resize-none"
            placeholder="상품 설명"
            onChange={handleChange}
            value={product.description || ''}
          />
          <Select
            name="categoryId"
            onValueChange={handleCategoryChange}
            value={product.category.id || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((category) => category.id !== ALL_CATEGORY_ID)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            className="cursor-pointer"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>등록</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
