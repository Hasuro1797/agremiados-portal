// const ACTION = Izipay.enums.payActions.PAY;
// const PROCESS_TYPE = Izipay.enums.processType.AUTHORIZATION;
// const PAY_METHOD = `${Izipay.enums.showMethods.CARD},${Izipay.enums.showMethods.YAPE}`;
// const ORDER_CURRENCY = Izipay.enums.currency.PEN;

const URL_SERVER_IPN = process.env.NEXT_PUBLIC_URL_SERVER_IPN;
interface PayMethods {
  CARD: string;
  YAPE: string;
  QR: string;
  PLIN: string;
}

interface IziVariables {
  action: string;
  processType: string;
  payMethod: PayMethods;
  currency: string;
  documentType: string;
  tyform: string;
}
interface IZIConfigProps {
  orderNumber: string;
  amount: string;
  transactionId: string;
  merchantCode: string;
  publicKey: string;
  idMerchantBuyer: string;
}

interface IZIUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  document: string;
  companyName?: string;
}

const getCurrentTransactionTime = () => {
  const timestamp = Date.now() * 1000;
  return timestamp.toString();
};
// Ejemp

export const setIziConfig = (
  config: IZIConfigProps,
  userInfo: IZIUserInfo,
  variables: IziVariables,
) => {
  return {
    config: {
      transactionId: config.transactionId,
      action: variables.action,
      merchantCode: config.merchantCode,
      order: {
        orderNumber: config.orderNumber,
        currency: variables.currency,
        amount: config.amount,
        processType: variables.processType,
        merchantBuyerId: config.idMerchantBuyer,
        dateTimeTransaction: getCurrentTransactionTime(),
        payMethod: `${variables.payMethod.CARD},${variables.payMethod.YAPE},${variables.payMethod.QR},${variables.payMethod.PLIN}`,
      },
      billing: {
        ...userInfo,
        documentType: variables.documentType, // documentType: Izipay.enums.documentType.DNI,
        // documentType: Izipay.enums.documentType.DNI,
      },
      render: {
        typeForm: variables.tyform, // typeForm: Izipay.enums.typeForm.POP_UP,
        // typeForm: Izipay.enums.typeForm.POP_UP,k
      },
      urlIPN: URL_SERVER_IPN,
      appearance: {
        theme: "blue",
      },
    },
  };
};
