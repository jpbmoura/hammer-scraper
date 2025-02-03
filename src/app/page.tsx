"use client";

import LoadingMessages from "@/components/ui/loading-message";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

type TableItem = {
  description: string;
  sale_value: string;
  evaluation_value: string;
};

const Home = () => {
  const [loading, setLoading] = React.useState(true);
  const [tableItems, setTableItems] = React.useState<TableItem[]>();

  const handleScrape = async () => {
    const response = await fetch("/api/scraper");
    const data = await response.json();
    setTableItems(data.results);
    setLoading(false);
  };

  React.useEffect(() => {
    handleScrape();
  }, []);

  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold text-start w-full mb-10">
        🔨 Hammer - Leilões de Imóveis (Arcoverde)
      </h1>

      <div className="w-full">
        {loading ? (
          <LoadingMessages />
        ) : (
          <Table className="w-full items-center justify-items-center">
            <TableCaption>
              Tabela com imóveis em leilão (caixa) - Arcoverde
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor Avaliado</TableHead>
                <TableHead>Valor Mínimo de Venda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableItems?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item?.description}
                  </TableCell>
                  <TableCell>{item?.evaluation_value}</TableCell>
                  <TableCell>{item?.sale_value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Home;
