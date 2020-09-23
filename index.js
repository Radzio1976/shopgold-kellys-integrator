const express = require('express');
const fs = require('fs');
var parseString = require('xml2js').parseString;
const { toXML } = require('jstoxml');
const port = process.env.PORT || 3000;

const app = express();

app.listen(port, '127.0.0.1', () => console.log(`http://localhost:${port}`));

app.get('/', (req, res) => {
  fs.readFile('./input/kellys.xml', 'utf8', (err, data) => {
    const xml = data;
    parseString(xml, function (err, result) {
      if (err) {
        return console.log("Nieprawidłowe dane", err)
      } else {
        let items = result.rss.channel[0].item;

        for (let i = 0; i < items.length; i++) {
          items[i].availability = items[i]['g:availability']
          delete items[i]["g:availability"];

          items[i].gtin = items[i]['g:gtin']
          delete items[i]["g:gtin"];

          items[i].id = items[i]['g:id']
          delete items[i]["g:id"];

          items[i].image_link = items[i]['g:image_link']
          delete items[i]["g:image_link"];

          items[i].item_group_id = items[i]['g:item_group_id']
          delete items[i]["g:item_group_id"];

          items[i].price = items[i]['g:price']
          delete items[i]["g:price"];

          items[i].product_type = items[i]['g:product_type']
          delete items[i]["g:product_type"];

          items[i].quantity = items[i]['g:quantity']
          delete items[i]["g:quantity"];

          items[i].shipping_weight = items[i]['g:shipping_weight']
          delete items[i]["g:shipping_weight"];

          items[i].size = ['g:size']
          delete items[i]["g:size"];

          delete items[i]["g:color"];
        }

        for (let i = 0; i < items.length; i++) {
          items[i].Podatek_Vat = "23"

          items[i].Darmowa_dostawa = "tak"

          items[i].Producent = {
            __cdata: ["KELLYS"]
          }

          items[i].Termin_wysylki = {
            __cdata: ["48 godzin"]
          }

          items[i].Stan_produktu = {
            __cdata: ["Nowy"]
          }

          items[i].Gwarancja = {
            __cdata: ["Gwarancja Producenta 24miesiące"]
          }

          items[i].Status = "tak"

          items[i].Opis = {
            __cdata: [items[i]['description'][0].replace(/<b>/g, '<b><br>').replace(/<(\/)b[^>]*>/g, '</b><br>')]
          };
          delete items[i].description;

          items[i].Dostepnosc = {
            __cdata: [items[i]['availability'][0]]
          };
          delete items[i].availability;

          items[i].Kod_ean = {
            __cdata: [items[i]['gtin'][0]]
          }
          delete items[i].gtin;

          items[i].Nr_katalogowy = {
            __cdata: [items[i]['id'][0]]
          }
          delete items[i].id;

          if (items[i]['image_link'] === undefined) {
            items[i].Zdjecie_glowne = []
          } else {
            items[i].Zdjecie_glowne = items[i]['image_link'][0];
          }

          delete items[i].image_link;

          delete items[i].item_group_id

          items[i].Cena_brutto = items[i]['price'][0];
          delete items[i].price;
          items[i].Cena_brutto = items[i].Cena_brutto.substring(0, items[i].Cena_brutto.length - 7)

          items[i].Ilosc_produktow = Number(items[i]['quantity'][0]).toFixed(2);
          delete items[i].quantity;

          if (items[i].product_type === undefined) {
            items[i].Kategoria = {
              __cdata: ["KELLYS/NIESKLASYFIKOWANE"]
            };
          } else {
            items[i].Kategoria = {
              __cdata: [items[i]['product_type'][0].replace(/ /g, '').replace(/>/g, '/').replace(/\n/g, '')]
            };
          }
          delete items[i].product_type;

          items[i].Waga = items[i]['shipping_weight'][0];
          items[i].Waga = Number(items[i].Waga.substring(0, items[i].Waga.length - 7)) + 6
          delete items[i].shipping_weight;

          items[i].Nazwa_produktu = {
            __cdata: [items[i]['title'][0]]
          }
          items[i].Nazwa_produktu.__cdata[0] = items[i].Nazwa_produktu.__cdata[0].substring(3, items[i].Nazwa_produktu.__cdata[0].length - 3)
          delete items[i].title;

          items[i].Meta_tytul = {
            __cdata: [items[i].Nazwa_produktu.__cdata[0]]
          }

          items[i].Meta_opis = {
            __cdata: [items[i].Nazwa_produktu.__cdata[0]]
          }

          items[i].Opis_krotki = {
            __cdata: [items[i].Nazwa_produktu.__cdata[0]]
          }

          items[i].Meta_slowa = {
            __cdata: ["kellysbike, kellys 2021, kellys rowery, rowery kellys, rowery górskie, rowery elektryczne, rowery"]
          }

          delete items[i].size;

          delete items[i].color;
          /*
          Linijka kodu poniżej służy do usuwania kategorii. Odkomentowywać ją tylko jeśli potrzebny jest plik
          tylko do aktualizacji. Do wystawiania produktów powinna być zakomentowana.
          */
          delete items[i].Kategoria
          //console.log(items[i].Opis)
        }

        let names = [];
        let urls = [];
        for (let i = 0; i < items.length; i++) {
          names.push(items[i].Nazwa_produktu.__cdata[0])
          urls.push(items[i].Zdjecie_glowne)
        }

        for (let i = 0; i < items.length; i++) {
          for (let k = 0; k < urls.length; k++) {
            if (i === k) {
              items[i].Opis.__cdata.unshift(`<a href="/images/${urls[k] !== undefined ? urls[k].slice(29) : ""}" target="_blank"><img alt="alt" src="/images/${urls[k] !== undefined ? urls[k].slice(29) : ""}" width = "300px" /></a > <br />`)
            }
          }
        }

        for (let i = 0; i < items.length; i++) {
          for (let k = 0; k < names.length; k++) {
            if (i === k) {
              items[i].Opis.__cdata.unshift(`<b>${names[i]}</b><br />`)
            }
          }
        }

        for (let i = 0; i < items.length; i++) {
          let desc1 = items[i].Opis.__cdata[0];
          let desc2 = items[i].Opis.__cdata[1];
          let desc3 = items[i].Opis.__cdata[2];
          let desc4 = `</br></br><b>Ze względu na wysokie standardy jakościowe rowerów KELLYS wszystkie modele tej marki sprzedajemy wyłącznie kompletnie zmontowane do jazdy, z przeglądem &quot;0&quot;. Obsługa ta jest dla naszych klientów BEZPŁATNA.</b><br />
          <hr /><b> <img alt="alt" src="/images/fotos/rowery/kellys/2018/kellys_logo.jpg" style="width: 300px" /></b>`
          let descResult = ""
          descResult = desc1.concat(desc2, desc3, desc4)
          items[i].Opis = {
            __cdata: [descResult]
          };
        }

        for (let i = 0; i < items.length; i++) {
          if (Number(items[i].Ilosc_produktow) === 0) {
            items[i].Dostepnosc.__cdata[0] = "Wyprzedane"
          } else if (Number(items[i].Ilosc_produktow) > 0 && Number(items[i].Ilosc_produktow) < 6) {
            items[i].Dostepnosc.__cdata[0] = "Na wyczerpaniu"
          } else if (Number(items[i].Ilosc_produktow) > 5) {
            items[i].Dostepnosc.__cdata[0] = "Dostępny"
          }
        }

        let finalData = {};
        finalData.Produkty = []

        for (let i = 0; i < items.length; i++) {
          finalData.Produkty.push({ Produkt: items[i] })
        }

        const xmlVersion = `<?xml version="1.0" encoding="UTF-8"?>`
        const xml = toXML(finalData).replace(/<__cdata>/g, "<![CDATA[").replace(/<(\/)?__cdata[^>]*>/g, ']]>');

        const finalXML = xmlVersion.concat(xml);

        fs.writeFile('./output/converted.xml', finalXML, (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
      }
    });
  })
})