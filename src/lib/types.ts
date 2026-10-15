/** Response shapes of the Ananta Jewellery storefront API. */

export type PageMeta = { total: number; page: number; limit: number; pages: number };
export type Paged<T> = { items: T[]; meta: PageMeta };

export type Pricing = { price: number; compareAtPrice: number | null; discountPct: number };

export type CardVariant = Pricing & { id: string; title: string; size: string | null; colour: string | null; stock: number };

export type ProductCard = Pricing & {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  hoverImage: string | null;
  category: { id: string; name: string; slug: string } | null;
  material: string | null;
  colour: string | null;
  stone: string | null;
  occasions: string[];
  ratingAvg: number;
  ratingCount: number;
  isBestseller: boolean;
  isNewArrival: boolean;
  inStock: boolean;
  stock: number;
  defaultVariantId: string | null;
  variants: CardVariant[];
  flashSale: { name: string; endsAt: string } | null;
};

export type ReviewSummary = { average: number; total: number; distribution: { rating: number; count: number }[] };

export type ProductVariant = CardVariant & { sku: string; imageIds: string[] };

export type ProductDetail = Pricing & {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  images: { id: string; url: string; alt: string; variantId: string | null }[];
  category: { name: string; slug: string; parent: { name: string; slug: string } | null } | null;
  collections: { id: string; name: string; slug: string; type: string }[];
  tags: { name: string; slug: string }[];
  material: string | null;
  colour: string | null;
  stone: string | null;
  occasions: string[];
  gender: string | null;
  weight: number | null;
  dimensions: { length: number | null; width: number | null; height: number | null };
  sizeGuide: string | null;
  careInstructions: string | null;
  warranty: string | null;
  hasCertificate: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  variants: ProductVariant[];
  stock: number;
  inStock: boolean;
  flashSale: { name: string; endsAt: string } | null;
  reviewSummary: ReviewSummary;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  adminReply: string | null;
  helpfulCount: number;
  createdAt: string;
};

export type Facet = { value: string; count: number };
export type Facets = {
  categories: { name: string; slug: string; count: number }[];
  materials: Facet[];
  colours: Facet[];
  stones: Facet[];
  occasions: Facet[];
  genders: Facet[];
  sizes: Facet[];
  price: { min: number; max: number };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  bannerImage: string | null;
  parentId: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  children?: Category[];
  _count?: { products: number };
};

export type CategoryDetail = Category & {
  parent: { name: string; slug: string } | null;
  children: { id: string; name: string; slug: string; image: string | null }[];
};

export type CollectionType = "COLOUR" | "BOND" | "OCCASION" | "CELEBRITY" | "GIFTING" | "CURATED";
export type Collection = {
  id: string;
  name: string;
  slug: string;
  type: CollectionType;
  description: string | null;
  image: string | null;
  bannerImage: string | null;
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  _count?: { products: number };
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image: string;
  mobileImage: string | null;
  link: string | null;
  ctaLabel: string | null;
  textColor?: string | null;
  placement: string;
};

export type BlogPostCard = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  type?: string;
  author?: string | null;
  tags?: string[];
  publishedAt: string | null;
};

export type BlogPost = BlogPostCard & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  more: BlogPostCard[];
};

export type HomeData = {
  banners: { hero: Banner[]; strip: Banner[]; promo: Banner[]; gifting: Banner[] };
  categories: Category[];
  bestsellers: ProductCard[];
  newArrivals: ProductCard[];
  giftingPicks: ProductCard[];
  collections: Record<"colour" | "bond" | "occasion" | "celebrity" | "gifting" | "curated", Collection[]>;
  flashSale: { name: string; description: string | null; endsAt: string; bannerImage: string | null; products: ProductCard[] } | null;
  posts: BlogPostCard[];
};

export type PublicSettings = {
  store: {
    name: string;
    tagline: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    social: { instagram?: string; facebook?: string; youtube?: string; pinterest?: string };
    announcement: string;
  };
  seo: { defaultTitle: string; defaultDescription: string; ogImage: string | null };
  checkout: { freeShippingAbove: number; codEnabled: boolean; codFee: number; giftWrapFee: number; guestCheckout: boolean };
  loyalty: { enabled: boolean; pointValue: number; earnPer100: number; signupBonus: number };
  payments: { razorpayEnabled: boolean; razorpayKeyId: string | null; mock: boolean; methods: Record<string, boolean> };
};

export type SearchSuggest = {
  products: ProductCard[];
  categories: { name: string; slug: string; image: string | null }[];
  collections: { name: string; slug: string; image: string | null }[];
  popular: string[];
};

export type QuoteLine = {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  variantTitle: string | null;
  image: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
  available: number;
};

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  minDays: number;
  maxDays: number;
  codAvailable: boolean;
  codFee: number;
};

export type Quote = {
  lines: QuoteLine[];
  itemCount: number;
  subtotal: number;
  couponCode: string | null;
  coupon: { code: string; type: string; description: string | null } | null;
  couponError: string | null;
  discount: number;
  couponDiscount: number;
  groupDiscount: { name: string; percent: number; amount: number } | null;
  freeShipping: boolean;
  shippingOptions: ShippingOption[];
  shippingRateId: string | null;
  shippingMethod: string | null;
  shippingFee: number;
  codAvailable: boolean;
  codFee: number;
  giftWrapFee: number;
  loyalty: { enabled: boolean; balance: number; maxRedeemable: number; applied: number; value: number };
  taxTotal: number;
  total: number;
  savings: number;
  warnings: string[];
};

export type Offer = {
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "BUY_X_GET_Y";
  value: number | null;
  minOrderValue: number | null;
  maxDiscount: number | null;
  endsAt: string | null;
  firstOrderOnly: boolean;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number;
  dateOfBirth: string | null;
  anniversary: string | null;
  gender: string | null;
  acceptsMarketing: boolean;
  createdAt: string;
};

export type LoyaltyEntry = {
  id: string;
  type: "EARN" | "REDEEM" | "ADJUST" | "EXPIRE";
  /** Positive when earned, negative when redeemed or expired. */
  points: number;
  orderId: string | null;
  note: string | null;
  createdAt: string;
};

export type LoyaltyLedger = { balance: number; ledger: LoyaltyEntry[] };

export type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type Address = AddressInput & { id: string; type: "HOME" | "WORK" | "OTHER"; isDefault: boolean };

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export type OrderEvent = { status: OrderStatus | null; title: string; note: string | null; createdAt: string };

export type ShipmentEvent = { id: string; status: string; location: string | null; note: string | null; occurredAt: string };
export type Shipment = {
  awb: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  status: string;
  events: ShipmentEvent[];
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: string;
  paymentMethod: "RAZORPAY" | "COD";
  total: number;
  placedAt: string;
  items: { name: string; image: string | null; quantity: number; variantTitle: string | null }[];
};

export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  sku: string;
  variantTitle: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
};

export type OrderDetail = Omit<OrderSummary, "items"> & {
  email: string;
  phone: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  codFee: number;
  giftWrapFee: number;
  loyaltyDiscount: number;
  taxTotal: number;
  refundedAmount: number;
  shippingAddress: AddressInput;
  shippingMethod: string | null;
  giftWrap: boolean;
  giftMessage: string | null;
  invoiceNumber: string | null;
  deliveredAt: string | null;
  events: OrderEvent[];
  shipments: Shipment[];
  refunds: { amount: number; status: string; createdAt: string; reason: string | null }[];
};

export type TrackResult = {
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  placedAt: string;
  items: { name: string; image: string | null; quantity: number; variantTitle: string | null }[];
  events: OrderEvent[];
  shipments: Shipment[];
};

export type RazorpayPayload = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  mock: boolean;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
};

export type PlaceOrderResponse = {
  order: { id: string; orderNumber: string; total: number; status: string; paymentMethod: "RAZORPAY" | "COD" };
  razorpay?: RazorpayPayload;
};
