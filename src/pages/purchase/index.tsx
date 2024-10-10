import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { makePurchase } from '@/api/purchase';
import { pageRoutes } from '@/apiRoutes';

import { PHONE_PATTERN } from '@/constants';
import { Layout, authStatusType } from '@/pages/common/components/Layout';
import { ItemList } from '@/pages/purchase/components/ItemList';
import { Payment } from '@/pages/purchase/components/Payment';
import { ShippingInformationForm } from '@/pages/purchase/components/ShippingInformationForm';
import { useAuthStore } from '@/store/auth/authStore';
import { useCartStore } from '@/store/cart/cartStore';
import { usePurchaseStore } from '@/store/purchase/purchaseStore';

export interface FormData {
  name: string;
  address: string;
  phone: string;
  requests: string;
  payment: string;
}

export interface FormErrors {
  phone: string;
}

export const Purchase: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const resetCart = useCartStore((state) => state.resetCart);
  const isLoading = usePurchaseStore((state) => state.purchase.isLoading);
  const purchaseStart = usePurchaseStore((state) => state.purchaseStart);
  const purchaseSuccess = usePurchaseStore((state) => state.purchaseSuccess);
  const purchaseFailure = usePurchaseStore((state) => state.purchaseFailure);

  const [formData, setFormData] = useState<FormData>({
    name: user?.displayName ?? '',
    address: '',
    phone: '',
    requests: '',
    payment: 'accountTransfer',
  });

  const [errors, setErrors] = useState<FormErrors>({
    phone: '',
  });

  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const { address, phone } = formData;
    const isPhoneValid = PHONE_PATTERN.test(phone);
    setIsFormValid(address.trim() !== '' && isPhoneValid);
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'phone') {
      if (!PHONE_PATTERN.test(value) && value !== '') {
        setErrors((prev) => ({
          ...prev,
          phone: '-를 포함한 휴대폰 번호만 가능합니다',
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleClickPurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || !user) return;

    purchaseStart();
    const purchaseData = {
      ...formData,
      totalAmount: 0,
      paymentMethod: formData.payment,
      shippingAddress: formData.address,
    };

    try {
      await makePurchase(purchaseData, user.uid, cart);
      purchaseSuccess();
      if (user) {
        resetCart(user.uid);
      }
      console.log('구매 성공!');
      navigate(pageRoutes.main);
    } catch (err) {
      if (err instanceof Error) {
        purchaseFailure(err.message);
        console.error(
          '잠시 문제가 발생했습니다! 다시 시도해 주세요.',
          err.message
        );
      } else {
        purchaseFailure('알 수 없는 오류가 발생했습니다.');
        console.error('잠시 문제가 발생했습니다! 다시 시도해 주세요.');
      }
    }
  };

  return (
    <Layout
      containerClassName="pt-[30px]"
      authStatus={authStatusType.NEED_LOGIN}
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleClickPurchase}>
            <ShippingInformationForm
              formData={formData}
              onChange={handleInputChange}
              errors={errors}
            />
            <ItemList />
            <Payment
              paymentMethod={formData.payment}
              onPaymentMethodChange={handleInputChange}
            />
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  '구매하기'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};
