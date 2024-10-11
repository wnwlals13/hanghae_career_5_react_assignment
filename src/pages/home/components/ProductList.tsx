import { IProduct, PaginatedProductsDTO } from '@/api/dtos/productDTO';
import { pageRoutes } from '@/apiRoutes';
import { Button } from '@/components/ui/button';
import { PRODUCT_PAGE_SIZE } from '@/constants';
import { extractIndexLink, isFirebaseIndexError } from '@/helpers/error';
import { useModal } from '@/hooks/useModal';
import { FirebaseIndexErrorModal } from '@/pages/error/components/FirebaseIndexErrorModal';
import { CartItem } from '@/types/cartType';
import { ChevronDown, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCardSkeleton } from '../skeletons/ProductCardSkeleton';
import { EmptyProduct } from './EmptyProduct';
import { ProductCard } from './ProductCard';
import { ProductRegistrationModal } from './ProductRegistrationModal';
import { useCallback } from 'react';

import { useAuthStore } from '@/store/auth/authStore';
import { useCartStore } from '@/store/cart/cartStore';
import { useFilterStore } from '@/store/filter/filterStore';
import { useProductStore } from '@/store/product/productStore';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { fetchProducts } from '@/api/product';
import { ProductFilter } from '@/types/productType';

interface ProductListProps {
  pageSize?: number;
}

export interface FetchProductResponse {
  products: IProduct[];
  hasNextPage: boolean;
  totalCount: number;
  nextCursor?: number;
  isInitial: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  pageSize = PRODUCT_PAGE_SIZE,
}) => {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isIndexErrorModalOpen, setIsIndexErrorModalOpen] =
    useState<boolean>(false);
  const [indexLink, setIndexLink] = useState<string | null>(null);

  const isLogin = useAuthStore((state) => state.isLogin);
  const user = useAuthStore((state) => state.user);
  const filter = useFilterStore((state) => state.selectFilter());

  const addCartItem = useCartStore((state) => state.addCartItem);
  const products = useProductStore((state) => state.products.items);
  const isLoading = useProductStore((state) => state.products.isLoading);
  const totalCount = useProductStore((state) => state.products.totalCount);
  const setProducts = useProductStore((state) => state.setProducts);

  const fetchPage = useCallback(
    async ({
      pageParam = currentPage,
      filter,
    }: {
      pageParam?: number;
      filter: ProductFilter;
    }): Promise<FetchProductResponse> => {
      const result: PaginatedProductsDTO = await fetchProducts(
        filter,
        pageSize,
        pageParam
      );

      return {
        products: result.products,
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount,
        nextCursor: pageParam + 1,
        isInitial: pageParam === 1,
      };
    },
    []
  );

  const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  }: UseInfiniteQueryResult<
    { pages: FetchProductResponse[]; pageParams?: number },
    Error
  > = useInfiniteQuery<
    FetchProductResponse,
    Error,
    { pages: FetchProductResponse[]; pageParams?: number },
    [string, ProductFilter],
    any
  >({
    queryKey: ['products', filter],
    queryFn: ({ pageParam }) => fetchPage({ pageParam, filter }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => lastPage.nextCursor,
    throwOnError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (isFirebaseIndexError(errorMessage)) {
        const link = extractIndexLink(errorMessage);
        setIndexLink(link);
        setIsIndexErrorModalOpen(true);
      }
      throw error;
    },
  });

  const isInitial = data?.pages.length === 1;
  useEffect(() => {
    if (status == 'success') {
      if (isInitial) setProducts(data.pages[0]);
      if (!isInitial) setCurrentPage((prev) => prev + 1);
    }
  }, [data]);

  useEffect(() => {
    if (status === 'success' && !isInitial) {
      data.pages.forEach((items, idx) => {
        if (idx + 1 === currentPage) setProducts(items);
      });
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPage({ pageParam: 1, filter });
  }, [filter]);

  const handleCartAction = (product: IProduct): void => {
    if (isLogin && user) {
      const cartItem: CartItem = { ...product, count: 1 };
      addCartItem({ item: cartItem, userId: user.uid, count: 1 });
      console.log(`${product.title} 상품이 \n장바구니에 담겼습니다.`);
    } else {
      navigate(pageRoutes.login);
    }
  };

  const handlePurchaseAction = (product: IProduct): void => {
    if (isLogin && user) {
      const cartItem: CartItem = { ...product, count: 1 };
      addCartItem({ item: cartItem, userId: user.uid, count: 1 });
      navigate(pageRoutes.cart);
    } else {
      navigate(pageRoutes.login);
    }
  };

  const handleProductAdded = (): void => {
    setCurrentPage(1);
    fetchPage({ pageParam: 1, filter });
  };

  const firstProductImage = products[0]?.image;

  useEffect(() => {
    if (firstProductImage) {
      const img = new Image();
      img.src = firstProductImage;
    }
  }, [firstProductImage]);

  if (status === 'error') <>Error:{error.message}</>;
  else
    return (
      <>
        <div className="space-y-4">
          <div className="flex justify-end mt-4">
            {isLogin && (
              <Button onClick={openModal}>
                <Plus className="mr-2 h-4 w-4" /> 상품 등록
              </Button>
            )}
          </div>

          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: pageSize }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyProduct onAddProduct={openModal} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product: any, index: any) => (
                  <ProductCard
                    key={`${product.id}_${index}`}
                    product={product}
                    onClickAddCartButton={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleCartAction(product);
                    }}
                    onClickPurchaseButton={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handlePurchaseAction(product);
                    }}
                  />
                ))}
              </div>
              {hasNextPage && currentPage * pageSize < totalCount && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                  >
                    {isFetchingNextPage
                      ? '로딩 중...'
                      : hasNextPage && '더 보기'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {isOpen && (
            <ProductRegistrationModal
              isOpen={isOpen}
              onClose={closeModal}
              onProductAdded={handleProductAdded}
            />
          )}
          <FirebaseIndexErrorModal
            isOpen={isIndexErrorModalOpen}
            onClose={() => setIsIndexErrorModalOpen(false)}
            indexLink={indexLink}
          />
        </div>
      </>
    );
};
