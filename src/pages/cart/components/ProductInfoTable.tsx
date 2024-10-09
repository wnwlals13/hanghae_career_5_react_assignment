import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductInfoTableRow } from '@/pages/cart/components/ProductInfoTableRow';
import { useAuthStore } from '@/store/auth/authStore';
import { useCartStore } from '@/store/cart/cartStore';
import { IUser } from '@/types/authType';
import { CartItem } from '@/types/cartType';

export const ProductInfoTable = () => {
  const cart: CartItem[] = useCartStore((state) => state.cart);
  const user: IUser | null = useAuthStore((state) => state.user);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">이미지</TableHead>
          <TableHead>상품명</TableHead>
          <TableHead>갯수</TableHead>
          <TableHead>가격</TableHead>
          <TableHead>삭제하기</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cart.map((item) => (
          <ProductInfoTableRow key={item.id} item={item} user={user} />
        ))}
      </TableBody>
    </Table>
  );
};
