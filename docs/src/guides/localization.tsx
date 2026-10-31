import { useState } from "react";
import { DataTable, NumberInput, Select, type Column } from "btui";
import { CITIES } from "../lib/data";
import { useText } from "../lib/i18n";
import { Code, H2, P, Stage } from "../lib/ui";

type Row = { name: string };
const NAMES = ["Zeynep", "Şule", "Çınar", "Ali", "İpek", "Işıl", "Ömer", "Can"].map((name) => ({ name }));

export default function Localization() {
  const t = useText();
  const [city, setCity] = useState("");
  const columns: Column<Row>[] = [{ key: "name", header: t({ tr: "Ad (başlığa basın)", en: "Name (press the header)" }) }];
  return (
    <>
      <p className="d-lead">{t({ tr: "Hazır metinler, sayılar, sıralama ve arama seçili dili izler.", en: "Built-in labels, numbers, sorting and search all follow the selected language." })}</p>
      <H2 id="provider">{t({ tr: "Dil seçimi", en: "Choosing a language" })}</H2>
      <P>{{ tr: "`BtuiProvider` Türkçe başlar. `locale=\"en\"` İngilizceye geçirir. Sağ üstteki TR/EN düğmesi bu sitede tam olarak bunu değiştiriyor.", en: "`BtuiProvider` starts in Turkish. `locale=\"en\"` switches to English. The TR/EN button at the top right changes exactly this on this site." }}</P>
      <Code>{`<BtuiProvider locale="en">…</BtuiProvider>`}</Code>
      <H2 id="custom">{t({ tr: "Kendi diliniz", en: "Your own language" })}</H2>
      <P>{{ tr: "`en` nesnesini açıp metinleri değiştirin. `lang` değeri sıralama ve sayı biçimini belirler.", en: "Spread the `en` object and replace the labels. The `lang` value drives sorting and number formats." }}</P>
      <Code>{`import { en, BtuiProvider, type BtuiLocale } from "btui";

const de: BtuiLocale = { ...en, lang: "de", search: "Suchen…", cancel: "Abbrechen" };

<BtuiProvider locale={de}>…</BtuiProvider>`}</Code>
      <H2 id="search">{t({ tr: "Türkçe arama", en: "Turkish search" })}</H2>
      <P>{{ tr: "Standart `toLowerCase` İ ve I harflerini bozar. btui dile duyarlı karşılaştırır: listeyi açıp \"izmir\" yazın.", en: "Plain `toLowerCase` breaks the letters İ and I. btui compares by locale: open the list and type \"izmir\"." }}</P>
      <Stage><div className="d-stack"><Select aria-label={t({ tr: "İl", en: "City" })} value={city} onChange={setCity} options={CITIES} /></div></Stage>
      <H2 id="sorting">{t({ tr: "Türkçe sıralama", en: "Turkish sorting" })}</H2>
      <P>{{ tr: "Çınar, C'den sonra; Şule, S'den sonra gelir. Ham karakter koduyla sıralasaydınız ikisi de listenin sonuna düşerdi.", en: "Çınar follows C and Şule follows S. Sorting by raw character code would push both to the end of the list." }}</P>
      <Stage block><DataTable columns={columns} rows={NAMES} getRowKey={(r) => r.name} defaultSort={{ key: "name", direction: "asc" }} /></Stage>
      <H2 id="numbers">{t({ tr: "Sayı ve para", en: "Numbers and money" })}</H2>
      <P>{{ tr: "`NumberInput` yazılan değeri dile göre biçimler: Türkçede 1.500,50, İngilizcede 1,500.50.", en: "`NumberInput` formats values per language: 1.500,50 in Turkish and 1,500.50 in English." }}</P>
      <Stage><div className="d-stack"><NumberInput aria-label={t({ tr: "Tutar", en: "Amount" })} defaultValue={1500.5} format={{ style: "currency", currency: "TRY" }} /></div></Stage>
    </>
  );
}
