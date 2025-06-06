import React from "react";
import { Box, Select, Input, VStack, Text, Button } from "@chakra-ui/react";

function unique(arr, key) {
  return [...new Set(arr.map(item => item[key]))].filter(Boolean);
}

function FiltersSidebar({ data, filters, setFilters }) {
  const paises = unique(data, "pais");
  const materiales = unique(data, "material_principal");

  return (
    <Box w={["100vw", "260px"]} p={4} bg="white" minH="100vh" borderRight="1px solid #e2e8f0">
      <VStack align="stretch" spacing={4}>
        <Text fontWeight="bold" fontSize="xl">Filtros</Text>
        <Select
          placeholder="País"
          value={filters.pais}
          onChange={e => setFilters(f => ({ ...f, pais: e.target.value }))}
        >
          {paises.map(pais => <option key={pais} value={pais}>{pais}</option>)}
        </Select>
        <Select
          placeholder="Material principal"
          value={filters.material}
          onChange={e => setFilters(f => ({ ...f, material: e.target.value }))}
        >
          {materiales.map(mat => <option key={mat} value={mat}>{mat}</option>)}
        </Select>
        <Select
          placeholder="Rango de masa"
          value={filters.masa}
          onChange={e => setFilters(f => ({ ...f, masa: e.target.value }))}
        >
          <option value="0-10">0-10 kg</option>
          <option value="10-50">10-50 kg</option>
          <option value="+50">Más de 50 kg</option>
        </Select>
        <Input
          placeholder="Fecha desde"
          type="date"
          value={filters.fechaDesde}
          onChange={e => setFilters(f => ({ ...f, fechaDesde: e.target.value }))}
        />
        <Input
          placeholder="Fecha hasta"
          type="date"
          value={filters.fechaHasta}
          onChange={e => setFilters(f => ({ ...f, fechaHasta: e.target.value }))}
        />
        <Button
          colorScheme="gray"
          onClick={() => setFilters({ pais: "", material: "", masa: "", fechaDesde: "", fechaHasta: "" })}
        >
          Limpiar Filtros
        </Button>
      </VStack>
    </Box>
  );
}

export default FiltersSidebar;
