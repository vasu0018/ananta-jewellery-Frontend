/** Brand artwork for generated images (favicons, PWA icons, social cards). Rendered by `next/og`. */

export const BRAND = { ink: "#231f1d", cream: "#faf6f1", blush: "#f9eeec", gold: "#b38c55", rose: "#c2777b" };

/** Square "A" monogram. `rounded` adds a soft corner radius for favicons; PWA icons stay full-bleed. */
export function Monogram({ size, rounded = false }: { size: number; rounded?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${BRAND.blush} 0%, ${BRAND.cream} 55%, #efe2cb 100%)`,
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size * 0.62,
          height: size * 0.62,
          borderRadius: "50%",
          border: `${Math.max(1, Math.round(size * 0.025))}px solid ${BRAND.gold}`,
          color: BRAND.ink,
          fontSize: size * 0.42,
          fontWeight: 600,
          lineHeight: 1,
          paddingBottom: size * 0.02,
        }}
      >
        A
      </div>
    </div>
  );
}
