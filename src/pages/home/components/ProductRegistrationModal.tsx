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
import { ChangeEvent, useCallback, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

// enum CategoryEnum {
//   '전체' = -1,
//   '옷' = 1,
//   '신발' = 2,
//   '가전제품' = 3,
//   '가구' = 4,
//   '기타' = 5,
// }

interface CategoryItem {
  id: string;
  name: string;
}

type Inputs = {
  title: string;
  price: number;
  description: string;
  category: CategoryItem;
  image: FileList;
};

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
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

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
  const onSubmit: SubmitHandler<Inputs> = useCallback(async (data: Inputs) => {
    try {
      console.log('product', data);
      if (data.image.length !== 1) {
        throw new Error('이미지를 선택해야 합니다.');
      }
      const imageUrl = await uploadImage(data.image[0]);
      if (!imageUrl) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      // title: '',
      // price: 0,
      // description: '',
      // category: { id: '', name: '' },
      // image: null,

      const newProduct = createNewProduct(
        {
          title: data.title,
          price: data.price,
          description: data.description,
          category: { id: data.category.id, name: data.category.id },
          image: null,
        },
        imageUrl
      );
      mutate(newProduct);
      setShowToast(true, 'upload');
      onClose();
      onProductAdded();
    } catch (error) {
      console.error('물품 등록에 실패했습니다.', error);
    }
  }, []);

  const handleCategoryChange = (value: string): void => {
    setProduct((prev) => ({
      ...prev,
      category: { ...prev.category, id: value },
    }));
    setValue('category.id', value);
    setValue('category.name', product.category.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>상품 등록</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="상품명"
              // value={product.title || ''}
              defaultValue={product.title || ''}
              {...register('title')}
              name="title"
              onChange={handleChange}
            />
            <Input
              type="number"
              placeholder="가격"
              // value={product.price || ''}
              defaultValue={product.price || ''}
              {...register('price')}
              name="price"
              onChange={handleChange}
            />
            <Textarea
              className="resize-none"
              placeholder="상품 설명"
              defaultValue={product.description || ''}
              {...register('description')}
              name="description"
              onChange={handleChange}
            />
            <Select
              onValueChange={handleCategoryChange}
              value={product.category.id || ''}
              {...register('category')}
              name="category"
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((category) => category.id !== ALL_CATEGORY_ID)
                  .map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className={category.name}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              className="cursor-pointer"
              type="file"
              accept="image/*"
              {...register('image', { required: true })}
              onChange={handleImageChange}
            />
          </div>
          <DialogFooter>
            <Button type="submit">등록</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
