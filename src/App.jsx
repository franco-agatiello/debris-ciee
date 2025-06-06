import React from "react";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <ChakraProvider>
      <Flex bg="gray.100" minH="100vh">
        <Dashboard />
      </Flex>
    </ChakraProvider>
  );
}

export default App;
