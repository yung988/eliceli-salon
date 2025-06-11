"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getServices } from "@/app/actions/booking-actions"
import { BookingForm } from "@/components/booking-form"
import Image from "next/image"

type Service = {
  id: number
  name: string
  description: string
  duration: number
  price: number
}

type ServiceCategory = {
  title: string
  description: string
  icon: React.ReactNode
  services: Service[]
}

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<ServiceCategory[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await getServices()
        if (response.success) {
          setServices(response.services)

          // Group services by category
          const maderoServices = response.services.filter((s) => s.name.includes("Maderoterapie"))
          const lymfoServices = response.services.filter((s) => s.name.includes("Lymfomodeling"))

          setCategories([
            {
              title: "MADEROTERAPIE",
              description:
                "Masážní technika využívající speciální dřevěné nástroje pro tvarování těla, redukci celulitidy a zlepšení kvality pokožky. Podporuje lymfatický systém a pomáhá formovat postavu.",
              icon: <WoodIcon className="h-8 w-8 text-white" />,
              services: maderoServices,
            },
            {
              title: "LYMFOMODELING",
              description:
                "Jemná manuální technika, která stimuluje lymfatický systém, pomáhá odvádět přebytečnou tekutinu a toxiny z těla. Ideální pro redukci otoků, detoxikaci a zlepšení celkového zdraví.",
              icon: <WaterIcon className="h-8 w-8 text-white" />,
              services: lymfoServices,
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-[#f0ebe4]">
        <div className="container px-4 text-center">
          <p>Načítání služeb...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-32 bg-[#f0ebe4]">
      <div className="container px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-serif text-center mb-6 tracking-tight"
        >
          NAŠE SLUŽBY
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-[#5a5a5a] max-w-3xl mx-auto mb-16"
        >
          Objevte umění relaxace a nechte nás vytvořit váš dokonalý okamžik klidu. Nabízíme 3 hlavní služby, které jsou
          navrženy tak, aby pečovaly o vaše tělo, mysl a duši.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.2 }}
              className="bg-white rounded-lg p-8 shadow-sm transition-all duration-500 elegant-hover"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#d9c9b8] rounded-full flex items-center justify-center mb-6 overflow-hidden">
                  <Image
                    src={
                      index === 0
                        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sE7X1NJS6O406E5wVl4z29JqsQNLdo.png"
                        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAoTSrODn05LWYmxbnTgUJR9v4nTlM.png"
                    }
                    alt={category.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-serif text-center mb-4">{category.title}</h3>
                <p className="text-[#5a5a5a] text-center mb-8">{category.description}</p>

                <div className="w-full space-y-6 mb-8">
                  {category.services.map((service) => (
                    <div key={service.id} className="border-t border-[#e8e0d5] pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-[#5a5a5a]">
                            {service.name.includes("vstupů") ? "Balíček více ošetření" : `${service.duration} minut`}
                          </p>
                        </div>
                        <div className="text-right font-medium">{service.price} Kč</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="rounded-full border-[#a89b84] text-[#a89b84] hover:bg-[#a89b84] hover:text-white"
                >
                  Více informací
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <BookingForm />
        </div>
      </div>
    </section>
  )
}

function WaterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v6m0 0c-3.5 0-7 1.5-7 6s3.5 6 7 6 7-1.5 7-6-3.5-6-7-6z" />
    </svg>
  )
}

function WoodIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 3v18M19 9V3h-4v6" />
      <circle cx="15" cy="9" r="2" />
      <path d="M19 9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7h8v2z" />
      <path d="M13 12v3c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

function CombinedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}
