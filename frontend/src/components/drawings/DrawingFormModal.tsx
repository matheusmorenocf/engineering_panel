import React from "react";
import { DrawingManualModal, FormField } from "./DrawingManualModal";

interface DrawingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawingFormModal({ isOpen, onClose }: DrawingFormModalProps) {
  // Definição dos campos que compõem o formulário de desenho
  const manualFields: FormField[] = [
    { 
      id: "drawingCode", 
      label: "Código do Desenho", 
      type: "input", 
      placeholder: "Ex: PG448", 
      halfWidth: true 
    },
    { 
      id: "title", 
      label: "Título do Projeto", 
      type: "input", 
      placeholder: "Digite o nome do projeto", 
      halfWidth: true 
    },
    { 
      id: "client", 
      label: "Cliente", 
      type: "input", 
      placeholder: "Nome do cliente", 
      halfWidth: true 
    },
    { 
      id: "orderNumber", 
      label: "Número da Encomenda", 
      type: "input", 
      placeholder: "Ex: ORD-2500", 
      halfWidth: true 
    },
    { 
      id: "designer", 
      label: "Desenhista Responsável", 
      type: "select", 
      defaultValue: "1",
      options: [
        { value: "1", label: "Eng. Ricardo Silva" },
        { value: "2", label: "Tec. Fernanda Costa" },
        { value: "3", label: "Ana Torres" }
      ],
      halfWidth: true 
    },
    { 
      id: "sector", 
      label: "Setor", 
      type: "select", 
      defaultValue: "usinagem",
      options: [
        { value: "usinagem", label: "Usinagem" },
        { value: "caldeiraria", label: "Caldeiraria" },
        { value: "fundicao", label: "Fundição" }
      ],
      halfWidth: true 
    },
  ];

  return (
    <DrawingManualModal 
      isOpen={isOpen} 
      onClose={onClose} 
      fields={manualFields} 
    />
  );
}