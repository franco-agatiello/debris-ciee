import React, { useState, useEffect, useMemo } from "react";
import FiltersSidebar from "./FiltersSidebar";
import MapView from "./MapView";
import ModeSelector from "./ModeSelector";
import { Box, Flex } from "@chakra-ui/react";

function Dashboard() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    pais: "",
    material: "",
    masa: "",
    fechaDesde: "",
    fechaHasta: ""
  });
  const [mode, setMode] = useState("puntos");

  useEffect(() => {
    fetch("/dashboard-derbis-espaciales/derbis.json")
      .then(res => res.json())
      .then(setData);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.pais && item.pais !== filters.pais) return false;
      if (filters.material && item.material_principal !== filters.material) return false;
      if (filters.masa) {
        if (filters.masa === "0-10" && !(item.tamano_caida_kg <= 10)) return false;
        if (filters.masa === "10-50" && !(item.tamano_caida_kg > 10 && item.tamano_caida_kg <= 50)) return false;
        if (filters.masa === "+50" && !(item.tamano_caida_kg > 50)) return false;
      }
      if (filters.fechaDesde && item.fecha < filters.fechaDesde) return false;
      if (filters.fechaHasta && item.fecha > filters.fechaHasta) return false;
      return true;
    });
  }, [data, filters]);

  return (
    <Flex flex="1">
      <FiltersSidebar data={data} filters={filters} setFilters={setFilters} />
      <Box flex="1" position="relative">
        <ModeSelector mode={mode} setMode={setMode} />
        <MapView data={filteredData} mode={mode} />
      </Box>
    </Flex>
  );
}

export default Dashboard;
