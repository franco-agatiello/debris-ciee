import React from "react";
import { ButtonGroup, Button, Box } from "@chakra-ui/react";

function ModeSelector({ mode, setMode }) {
  return (
    <Box position="absolute" top="16px" right="16px" zIndex="1000">
      <ButtonGroup isAttached variant="outline">
        <Button
          colorScheme={mode === "puntos" ? "blue" : "gray"}
          onClick={() => setMode("puntos")}
        >Puntos</Button>
        <Button
          colorScheme={mode === "calor" ? "blue" : "gray"}
          onClick={() => setMode("calor")}
        >Mapa de calor</Button>
      </ButtonGroup>
    </Box>
  );
}

export default ModeSelector;
