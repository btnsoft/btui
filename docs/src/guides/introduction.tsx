import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "btui";
import { useLang, useText } from "../lib/i18n";
import { H2, P } from "../lib/ui";

export default function Introduction() {
  const t = useText();
  const lang = useLang();
  const rows = [
    [{ tr: "Hazır görünüm", en: "Ready styling" }, { tr: "Evet, tek stil dosyası", en: "Yes, one stylesheet" }, { tr: "Hayır, stili siz yazarsınız", en: "No, you write the styles" }],
    [{ tr: "İş bileşenleri", en: "Business components" }, { tr: "DataTable, FilterBar, Kpi, AppShell, FileDropzone", en: "DataTable, FilterBar, Kpi, AppShell, FileDropzone" }, { tr: "Yalnız temel parçalar", en: "Primitives only" }],
    [{ tr: "API", en: "API" }, { tr: "Tek bileşen, az prop", en: "One component, few props" }, { tr: "Birleştirilen parçalar", en: "Composed parts" }],
    [{ tr: "Erişilebilirlik", en: "Accessibility" }, { tr: "Base UI'dan gelir", en: "Inherited from Base UI" }, { tr: "Dahili", en: "Built in" }],
  ];
  return (
    <>
      <p className="d-lead">{t({ tr: "btui, kurumsal iş yazılımları için hazır bir React arayüz kitidir. Davranışı Base UI'a bırakır, görünümü ve iş bileşenlerini kendisi getirir.", en: "btui is a ready React UI kit for corporate software. It leaves behaviour to Base UI and brings the look and the business components itself." })}</p>
      <H2 id="why">{t({ tr: "Neden var", en: "Why it exists" })}</H2>
      <P>{{ tr: "Filo, satın alma, saha operasyonu gibi uygulamaların ekranları birbirine benzer: filtre, uzun tablo, ayrıntı penceresi, onay. Pazarlama sitelerine göre çizilmiş kitler bu ekranlarda yer harcar. btui aynı alana daha çok bilgi sığdırır ve ciddi durur.", en: "Fleet, procurement and field operations apps share the same screens: filters, a long table, a detail window, an approval. Kits drawn for marketing sites waste space on them. btui fits more information in the same area and keeps a serious tone." }}</P>
      <H2 id="principles">{t({ tr: "İlkeler", en: "Principles" })}</H2>
      <ul className="d-ul">
        <li>{t({ tr: "Bilgi süsten önce gelir. Köşe, gölge ve renk yalnız anlam taşıdığında kullanılır.", en: "Information comes before decoration. Curves, shadows and colour appear only when they mean something." })}</li>
        <li>{t({ tr: "Ekran başına tek ana eylem. Durum rengi yazının yanında durur, tek başına anlam taşımaz.", en: "One main action per screen. Status colour sits beside text and never carries meaning alone." })}</li>
        <li>{t({ tr: "Klavye birinci sınıf girdi. Veri girişi yapan kişi fareye uzanmak zorunda kalmaz.", en: "The keyboard is a first-class input. People entering data never have to reach for the mouse." })}</li>
        <li>{t({ tr: "Yerel biçim varsayılandır: sayı, para, tarih ve Türkçe harfler doğru çalışır.", en: "Local formats are the default: numbers, money, dates and Turkish letters work properly." })}</li>
      </ul>
      <H2 id="base-ui">{t({ tr: "Base UI ile farkı", en: "Compared to Base UI" })}</H2>
      <P>{{ tr: "Base UI stilsiz temel parçalar verir. btui bunların üstünde durur; özel bir tasarım sistemi kuracaksanız Base UI'ı, hazır bir iş arayüzü istiyorsanız btui'ı seçin.", en: "Base UI provides unstyled primitives. btui sits on top of them. Pick Base UI to build a custom design system and btui when you want a finished business UI." }}</P>
      <div className="d-compare">
        <table>
          <thead><tr><th /><th>btui</th><th>Base UI</th></tr></thead>
          <tbody>{rows.map(([a, b, c]) => <tr key={t(a)}><th>{t(a)}</th><td>{t(b)}</td><td>{t(c)}</td></tr>)}</tbody>
        </table>
      </div>
      <div><Button variant="primary" iconEnd={<IconArrowRight size={15} />} render={<a href={`#/${lang}/installation`} />} nativeButton={false}>{t({ tr: "Kuruluma geç", en: "Go to installation" })}</Button></div>
    </>
  );
}
