import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET() {
  console.log(`⛏  Starting scrapper`);

  const scrapeUrl =
    "https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp?sltTipoBusca=imoveis";

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  );

  console.log(`⏳  Loading page...`);
  await page.goto(scrapeUrl, { waitUntil: "networkidle2" });
  console.log(`✅  Page loaded!`);

  console.log(`⏳  Selecting state...`);
  await page.waitForSelector("#cmb_estado", { visible: true });
  await page.select("#cmb_estado", "PE");
  console.log(`✅  State selected!`);

  console.log(`⏳  Selecting city...`);
  await page.waitForFunction(() => {
    const cidadeSelect = document.querySelector(
      "#cmb_cidade"
    ) as HTMLSelectElement;
    return cidadeSelect && cidadeSelect.options.length > 1;
  });
  await page.select("#cmb_cidade", "5245");
  console.log(`✅  City selected!`);

  await page
    .waitForFunction(
      () => {
        const btn = document.querySelector("#btn_next0") as HTMLButtonElement;
        return btn && !btn.disabled;
      },
      { timeout: 60000 }
    )
    .catch(() => {
      console.log("⚠️  Botão #btn_next0 não ficou ativo a tempo.");
    });

  const nextButton0 = await page.$("#btn_next0");

  if (nextButton0) {
    console.log("⏳ Botão #btn_next0 encontrado. Tentando clicar...");
    await page.evaluate((btn) => btn.scrollIntoView(), nextButton0);
    await new Promise((res) => setTimeout(res, 1000));
    await nextButton0.click();
  } else {
    console.log("❌ Botão #btn_next0 não encontrado. Encerrando scraping.");
    await browser.close();
    return NextResponse.json({
      error:
        "Botão de continuar não encontrado. Verifique se há imóveis disponíveis.",
    });
  }
  console.log(`✅  Filters selected!`);

  console.log(`⏳  Waiting for items to load...`);
  await new Promise((res) => setTimeout(res, 2000));

  const nextButton1 = await page.$("#btn_next1");

  if (!nextButton1) {
    console.log(
      "⚠️  Botão #btn_next1 não encontrado. Verificando se a página já carregou os imóveis."
    );
  } else {
    console.log("✅ Botão #btn_next1 encontrado. Tentando clicar...");
    await nextButton1.click();
  }

  console.log(`✅  Items loaded...`);

  const results = [];
  let currentPage = 1;
  let lastPage = 1;

  while (true) {
    console.log(`⏳  Scraping page ${currentPage}...`);

    await page.waitForSelector(".dadosimovel-col2", { visible: true });

    const items = await page.evaluate(() => {
      const imoveis = Array.from(
        document.querySelectorAll(".dadosimovel-col2")
      );

      return imoveis.map((item) => {
        return {
          description: item.querySelector("a")?.textContent?.trim() || "",
          sale_value:
            item.innerHTML
              .match(/Valor mínimo de venda:.*?<br>/i)?.[0]
              ?.replace(/Valor mínimo de venda:|<br>|<\/?[^>]+>/g, "")
              .trim() || "",
          evaluation_value:
            item.innerHTML
              .match(/Valor de avaliação:.*?<br>/i)?.[0]
              ?.replace(/(<br>|Valor de avaliação:)/g, "")
              .trim() || "",
        };
      });
    });

    console.log(`🔍  Found ${items.length} items on page ${currentPage}`);

    results.push(...items);
    const paginationInfo = await page.evaluate(() => {
      const pagination = document.querySelector("#paginacao");

      if (!pagination) return { currentPage: 1, lastPage: 1 };

      const links = Array.from(pagination.querySelectorAll("a"));
      const pages = links
        .map((link) => link.textContent?.trim())
        .filter(Boolean);
      const lastPage = parseInt(pages[pages.length - 1] || "1", 10);

      const currentPage = parseInt(
        pagination.querySelector("b")?.textContent?.trim() || "1",
        10
      );

      return { currentPage, lastPage };
    });

    console.log("🔍  Pagination Info:", paginationInfo);

    currentPage = paginationInfo.currentPage;
    lastPage = paginationInfo.lastPage;

    console.log(`🔄  Current Page: ${currentPage}, Last Page: ${lastPage}`);

    if (currentPage >= lastPage) {
      break;
    }

    console.log(`⏳  Going to next page...`);

    const nextPageLink = await page.$(`
      #paginacao a[href*="carregaListaImoveis(${currentPage + 1})"]
    `);

    if (nextPageLink) {
      await page.evaluate((link) => link.click(), nextPageLink);
      await page.waitForSelector(".dadosimovel-col2", { visible: true });
    } else {
      break;
    }
  }

  await browser.close();

  console.log(`🎉  Scraping finished!`);

  return NextResponse.json({
    total: results.length,
    results,
  });
}
