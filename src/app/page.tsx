"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [loading, setLoading] = React.useState(false);
  const [tableItems, setTableItems] = React.useState<TableItem[]>([]);

  const [uf, setUf] = React.useState("");
  const [city, setCity] = React.useState("");

  const handleScrape = async () => {
    setLoading(true);
    const response = await fetch(`/api/scraper?uf=${uf}&city=${city}`);
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const data = await response.json();
    setTableItems(data.results);
    setLoading(false);
  };

  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold text-start w-full mb-10">
        🔨 Hammer - Leilões de Imóveis
      </h1>

      <div className="flex flex-row gap-4 justify-self-start md:px-10 px-0 mb-10">
        <Input
          disabled={loading}
          placeholder="UF"
          value={uf}
          onChange={(e) => setUf(e.target.value.toUpperCase())}
        />
        <Input
          disabled={loading}
          placeholder="CIDADE"
          value={city}
          onChange={(e) => setCity(e.target.value.toUpperCase())}
        />
        <Button disabled={loading} onClick={() => handleScrape()}>
          Buscar
        </Button>
      </div>

      <div className="w-full">
        {loading ? (
          <LoadingMessages />
        ) : (
          <Table className="w-full items-center justify-items-center">
            <TableCaption>
              {tableItems.length === 0
                ? "Faça uma pesquisa válida para continuar."
                : `Tabela com imóveis em leilão (caixa) - ${city}/${uf}`}
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
