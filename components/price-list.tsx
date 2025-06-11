"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PriceList() {
  const [activeTab, setActiveTab] = useState("maderoterapie")

  const services = {
    maderoterapie: [
      {
        name: "Maderoterapie - Celotělová",
        description:
          "Masážní technika využívající speciální dřevěné nástroje pro tvarování těla, redukci celulitidy a zlepšení kvality pokožky.",
        duration: 50,
        price: 890,
      },
      {
        name: "Maderoterapie - 5 vstupů",
        description:
          "Balíček 5 vstupů na celotělovou maderoterapii se slevou 50%. Ideální pro dosažení viditelných výsledků.",
        duration: 50,
        price: 3990,
        isPackage: true,
      },
      {
        name: "Maderoterapie - 10 vstupů",
        description: "Balíček 10 vstupů na celotělovou maderoterapii (9 + 1 ZDARMA). Maximální efekt pro vaše tělo.",
        duration: 50,
        price: 7990,
        isPackage: true,
      },
    ],
    lymfomodeling: [
      {
        name: "Lymfomodeling - Vrchní část",
        description:
          "Jemná manuální technika zaměřená na vrchní část těla, která stimuluje lymfatický systém a pomáhá odvádět přebytečnou tekutinu.",
        duration: 50,
        price: 2490,
      },
      {
        name: "Lymfomodeling - Celé tělo",
        description: "Komplexní lymfatická masáž celého těla pro maximální detoxikaci a redukci otoků.",
        duration: 100,
        price: 3890,
      },
      {
        name: "Lymfomodeling - 3 vstupy",
        description:
          "Balíček 3 vstupů na lymfomodeling celého těla se slevou 50%. Intenzivní kúra pro váš lymfatický systém.",
        duration: 100,
        price: 9725,
        isPackage: true,
      },
      {
        name: "Lymfomodeling - 5 vstupů",
        description:
          "Balíček 5 vstupů na lymfomodeling celého těla (4 + 1 ZDARMA). Kompletní péče pro dlouhodobé výsledky.",
        duration: 100,
        price: 15560,
        isPackage: true,
      },
    ],
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <Tabs defaultValue="maderoterapie" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="maderoterapie" className="uppercase tracking-wider text-xs">
            Maderoterapie
          </TabsTrigger>
          <TabsTrigger value="lymfomodeling" className="uppercase tracking-wider text-xs">
            Lymfomodeling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maderoterapie" className="bg-white rounded-lg p-8 shadow-sm">
          <h4 className="text-2xl uppercase font-light tracking-wider mb-6">Ceník maderoterapie</h4>
          <div className="space-y-6">
            {services.maderoterapie.map((service, index) => (
              <div key={index} className="border-b border-[#f0ebe4] pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-light uppercase tracking-wider text-base">{service.name}</h5>
                    {service.isPackage ? (
                      <span className="inline-block bg-[#a89b84]/10 text-[#a89b84] text-xs px-2 py-1 rounded-full uppercase tracking-wider">
                        Balíček
                      </span>
                    ) : (
                      <span className="text-sm text-[#5a5a5a]">{service.duration} minut</span>
                    )}
                  </div>
                  <div className="text-xl">{service.price} Kč</div>
                </div>
                <p className="text-sm text-[#5a5a5a]">{service.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lymfomodeling" className="bg-white rounded-lg p-8 shadow-sm">
          <h4 className="text-2xl uppercase font-light tracking-wider mb-6">Ceník lymfomodelingu</h4>
          <div className="space-y-6">
            {services.lymfomodeling.map((service, index) => (
              <div key={index} className="border-b border-[#f0ebe4] pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-light uppercase tracking-wider text-base">{service.name}</h5>
                    {service.isPackage ? (
                      <span className="inline-block bg-[#a89b84]/10 text-[#a89b84] text-xs px-2 py-1 rounded-full uppercase tracking-wider">
                        Balíček
                      </span>
                    ) : (
                      <span className="text-sm text-[#5a5a5a]">{service.duration} minut</span>
                    )}
                  </div>
                  <div className="text-xl">{service.price} Kč</div>
                </div>
                <p className="text-sm text-[#5a5a5a]">{service.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
