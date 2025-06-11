"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, ChevronDown, Clock, Facebook, Instagram, Mail, MapPin, Phone, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingForm } from "@/components/booking-form"
import { PriceList } from "@/components/price-list"
import { Toaster } from "@/components/ui/toaster"
import ReactCompareImage from 'react-compare-image'
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar"

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const testimonials = [
    {
      name: "Karolína M.",
      quote: "Maderoterapie u Elišky mi změnila život. Cítím se lehčí a moje pokožka vypadá mnohem lépe.",
      stars: 5,
    },
    {
      name: "Tereza V.",
      quote: "Pravidelné lymfomodelování mi pomohlo zbavit se otoků a cítím se mnohem energičtěji.",
      stars: 5,
    },
    {
      name: "Martina K.",
      quote: "Profesionální přístup a úžasné výsledky. Doporučuji každé ženě, která chce pro své tělo to nejlepší.",
      stars: 5,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  useEffect(() => {
    document.body.classList.add('overflow-x-hidden')
    return () => document.body.classList.remove('overflow-x-hidden')
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <SidebarProvider defaultIsOpen={false}>
      <main className="bg-white text-[#3a3a3a] overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#f0ebe4]">
          <div className="container mx-auto px-6 py-2 md:py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Eliška Tomalová" width={120} height={40} className="block md:hidden" />
              <Image src="/logo.svg" alt="Eliška Tomalová" width={180} height={50} className="hidden md:block" />
            </Link>
            <div>
              <SidebarTrigger />
            </div>
          </div>
        </nav>
        {/* Sidebar menu zůstává beze změny, protože stav se nyní řídí přes kontext */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex justify-between items-center">
              <Image src="/logo.svg" alt="Eliška Tomalová" width={120} height={40} />
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="#about" className="block py-3 px-2 text-lg font-medium">O mně</Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="#services" className="block py-3 px-2 text-lg font-medium">Služby</Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="#gallery" className="block py-3 px-2 text-lg font-medium">Galerie</Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="#contact" className="block py-3 px-2 text-lg font-medium">Kontakt</Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button className="w-full bg-[#a89b84] hover:bg-[#8c8270] text-white uppercase tracking-wider text-xs mt-4" onClick={() => {
                  const bookingSection = document.getElementById('booking')
                  if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' })
                }}>
                  Rezervovat termín
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-8 border-t pt-6 space-y-4">
              <div className="flex gap-4">
                <Link href="https://www.instagram.com/_madero_therapy_/" target="_blank" rel="noopener noreferrer" className="text-[#a89b84] hover:text-[#8c8270]">
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link href="https://www.facebook.com/maderotherapybyeliceli/" target="_blank" rel="noopener noreferrer" className="text-[#a89b84] hover:text-[#8c8270]">
                  <Facebook className="h-6 w-6" />
                </Link>
              </div>
              <div className="text-sm text-[#5a5a5a]">
                <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[#a89b84]" />Národní třída 123, Hodonín</div>
                <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-[#a89b84]" />+420 777 888 999</div>
                <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-[#a89b84]" />info@madero-therapy.cz</div>
                <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-[#a89b84]" />Po-Pá 9:00-19:00, So 9:00-14:00</div>
              </div>
            </div>
          </SidebarContent>
          <SidebarFooter>
            <div className="text-xs text-[#a89b84] text-center">© {new Date().getFullYear()} Eliška Tomalová</div>
          </SidebarFooter>
        </Sidebar>
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-61W11Gxpt1Br01zuSqPCxlw5vIc0PJ.webp"
              alt="Maderoterapie a lymfomodeling"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          <div className="container mx-auto px-6 md:px-10 relative z-10 py-20 md:py-32">
            <div className="max-w-3xl">
              <motion.div
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="space-y-6"
              >
                <motion.h2 variants={fadeIn} className="text-white text-sm uppercase tracking-[0.3em]">
                  Lymfomodeling & Maderoterapie
                </motion.h2>

                <motion.h1
                  variants={fadeIn}
                  className="text-white text-4xl md:text-6xl lg:text-7xl uppercase font-light tracking-wider leading-tight"
                >
                  Dopřejte si luxusní péči pro vaše tělo
                </motion.h1>

                <motion.p variants={fadeIn} className="text-white/90 text-lg md:text-xl max-w-2xl">
                  Objevte sílu lymfomodelingu a maderoterapie v Hodoníně. Profesionální péče zaměřená na vaše zdraví a
                  krásu.
                </motion.p>

                <motion.div variants={fadeIn} className="pt-4 flex flex-col sm:flex-row gap-4">
                  <BookingForm />
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
            <Link href="#about" className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
              <span className="text-xs uppercase tracking-widest mb-2">Objevte více</span>
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </Link>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="md:w-1/2"
              >
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-24 h-24 border border-[#a89b84]"></div>
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-21%20at%2011.10.13-z9ishBxQxJXFn49ug2c8BYnXfXPHRH.png"
                      alt="Eliška Tomalová"
                      width={500}
                      height={600}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 border border-[#a89b84]"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="md:w-1/2"
              >
                <h2 className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4">O mně</h2>
                <h3 className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6">Eliška Tomalová</h3>
                <p className="text-lg md:text-xl text-[#5a5a5a] mb-6 leading-relaxed">
                  "Věřím v vědomý dotek a schopnost těla se uzdravit."
                </p>
                <p className="text-base md:text-lg text-[#5a5a5a] mb-6 leading-relaxed">
                  Jmenuji se Eliška Tomalová a jsem certifikovanou terapeutkou v oblasti maderoterapie a lymfomodelingu.
                  Mým posláním je pomáhat ženám cítit se lépe ve svém těle, zbavit se otoků, celulitidy a napětí.
                </p>
                <p className="text-base md:text-lg text-[#5a5a5a] mb-8 leading-relaxed">
                  Každé ošetření je individuální a přizpůsobené vašim potřebám. Používám pouze přírodní produkty nejvyšší
                  kvality a neustále se vzdělávám v nejnovějších technikách a postupech.
                </p>
                <Button className="bg-[#a89b84] hover:bg-[#8c8270] text-white uppercase tracking-wider text-xs">
                  Více o mně
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 md:py-32 bg-[#f8f5f2]">
          <div className="container mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4"
              >
                Naše služby
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6"
              >
                Luxusní péče pro vaše tělo
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[#5a5a5a]"
              >
                Nabízíme špičkové služby v oblasti lymfomodelingu a maderoterapie, které jsou navrženy tak, aby pečovaly o
                vaše tělo, mysl a duši.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 elegant-hover"
              >
                <div className="relative h-64">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sE7X1NJS6O406E5wVl4z29JqsQNLdo.png"
                    alt="Maderoterapie"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8">
                  <h4 className="text-2xl uppercase font-light tracking-wider mb-4">Maderoterapie</h4>
                  <p className="text-[#5a5a5a] mb-6">
                    Masážní technika využívající speciální dřevěné nástroje pro tvarování těla, redukci celulitidy a
                    zlepšení kvality pokožky. Podporuje lymfatický systém a pomáhá formovat postavu.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-[#a89b84] hover:text-[#8c8270] transition-colors uppercase tracking-wider text-xs"
                  >
                    Více informací
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 elegant-hover"
              >
                <div className="relative h-64">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-38CyQnZtabX2SALWUHkbMLyw64VoST.png"
                    alt="Lymfomodeling"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8">
                  <h4 className="text-2xl uppercase font-light tracking-wider mb-4">Lymfomodeling</h4>
                  <p className="text-[#5a5a5a] mb-6">
                    Jemná manuální technika, která stimuluje lymfatický systém, pomáhá odvádět přebytečnou tekutinu a
                    toxiny z těla. Ideální pro redukci otoků, detoxikaci a zlepšení celkového zdraví.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-[#a89b84] hover:text-[#8c8270] transition-colors uppercase tracking-wider text-xs"
                  >
                    Více informací
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

            <PriceList />

            <div className="text-center mt-12">
              <BookingForm />
            </div>
          </div>
        </section>

        {/* Before & After Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4"
              >
                Výsledky
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6"
              >
                Před a po
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[#5a5a5a]"
              >
                Podívejte se na skutečné výsledky našich klientů. Posuňte posuvník pro porovnání před a po ošetření.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-center text-lg uppercase font-light tracking-wider mb-4">Porovnání výsledků</h4>
                <BeforeAfterSlider />
              </div>
            </motion.div>

            <div className="text-center mt-12">
              <p className="text-[#5a5a5a] mb-6 max-w-2xl mx-auto">
                Výsledky se mohou lišit v závislosti na individuálních faktorech. Pro dosažení optimálních výsledků
                doporučujeme sérii 5-10 ošetření.
              </p>
              <BookingForm />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 bg-[#f8f5f2]">
          <div className="container mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4"
              >
                Výhody
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6"
              >
                Proč zvolit naše služby
              </motion.h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Profesionální přístup",
                  description:
                    "Jsme certifikovaní odborníci s mnohaletými zkušenostmi v oblasti lymfomodelingu a maderoterapie.",
                },
                {
                  title: "Individuální péče",
                  description:
                    "Každé ošetření je přizpůsobeno vašim potřebám a požadavkům pro dosažení nejlepších výsledků.",
                },
                {
                  title: "Přírodní produkty",
                  description: "Používáme pouze přírodní produkty nejvyšší kvality, které jsou šetrné k vaší pokožce.",
                },
                {
                  title: "Moderní techniky",
                  description:
                    "Neustále se vzděláváme v nejnovějších technikách a postupech pro maximální efektivitu ošetření.",
                },
                {
                  title: "Relaxační prostředí",
                  description: "Náš salon nabízí klidné a příjemné prostředí, kde se můžete uvolnit a odpočinout si.",
                },
                {
                  title: "Viditelné výsledky",
                  description:
                    "Naši klienti pozorují viditelné výsledky již po několika ošetřeních, které se s pravidelností zlepšují.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-lg elegant-shadow"
                >
                  <h4 className="text-xl uppercase font-light tracking-wider mb-4">{benefit.title}</h4>
                  <p className="text-[#5a5a5a]">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4"
              >
                Galerie
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6"
              >
                Naše práce a výsledky
              </motion.h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "/images/vysledky/beforandafter1.jpg",
                "/images/vysledky/beforandafter2.jpeg",
                "/images/vysledky/beforandafter3.jpg",
                "/images/vysledky/beforandafter4.jpg",
                "/images/vysledky/beforandafter5.jpg",
                "/images/vysledky/beforandafter6.jpg"
              ].map((src, index) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="overflow-hidden rounded-lg"
                >
                  <Image
                    src={src}
                    alt={`Galerie - výsledky ${index + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-32 bg-[#f8f5f2]">
          <div className="container mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4"
              >
                Reference
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6"
              >
                Co říkají naši klienti
              </motion.h3>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-8 md:p-12 elegant-shadow">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-lg md:text-xl mb-6 text-[#5a5a5a]">{testimonials[activeTestimonial].quote}</p>
                  <p className="uppercase tracking-wider text-sm">{testimonials[activeTestimonial].name}</p>
                </motion.div>
              </div>

              <div className="flex justify-center mt-8 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === activeTestimonial ? "bg-[#a89b84]" : "bg-[#e8e0d5]"}`}
                    onClick={() => setActiveTestimonial(index)}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rezervační sekce */}
        <section id="booking" className="py-20 md:py-32 bg-[url('/images/lymphatic-drainage-massage.jpg')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="container mx-auto px-6 md:px-10 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/80 mb-4">Rezervace</h2>
              <h3 className="text-3xl md:text-4xl uppercase font-light tracking-wider text-white mb-6">
                Dopřejte si chvíli pro sebe
              </h3>
              <p className="text-white/80 mb-8 text-lg">
                Rezervujte si termín ještě dnes a udělejte první krok k lepšímu pocitu ve vašem těle.
              </p>
              <BookingForm />
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm uppercase tracking-[0.3em] text-[#a89b84] mb-4"
              >
                Kontakt
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-4xl uppercase font-light tracking-wider mb-6"
              >
                Jak nás najdete
              </motion.h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h4 className="text-xl uppercase font-light tracking-wider mb-4">Kontaktní informace</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-[#a89b84] mt-1" />
                      <div>
                        <h5 className="uppercase tracking-wider text-xs mb-1">Adresa</h5>
                        <p className="text-[#5a5a5a]">Národní třída 123, Hodonín 695 01</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-[#a89b84] mt-1" />
                      <div>
                        <h5 className="uppercase tracking-wider text-xs mb-1">Telefon</h5>
                        <p className="text-[#5a5a5a]">+420 777 888 999</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-[#a89b84] mt-1" />
                      <div>
                        <h5 className="uppercase tracking-wider text-xs mb-1">Email</h5>
                        <p className="text-[#5a5a5a]">info@madero-therapy.cz</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Link href="https://www.instagram.com/_madero_therapy_/" target="_blank" rel="noopener noreferrer" className="text-[#a89b84] hover:text-[#8c8270] transition-colors">
                        <Instagram className="h-6 w-6" />
                      </Link>
                      <div>
                        <h5 className="uppercase tracking-wider text-xs mb-1">Instagram</h5>
                        <p className="text-[#5a5a5a]">@_madero_therapy_</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl uppercase font-light tracking-wider mb-4">Otevírací doba</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#5a5a5a]">Pondělí - Pátek</span>
                      <span className="text-[#5a5a5a]">9:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5a5a5a]">Sobota</span>
                      <span className="text-[#5a5a5a]">9:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5a5a5a]">Neděle</span>
                      <span className="text-[#5a5a5a]">Zavřeno</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="h-[400px] rounded-lg overflow-hidden elegant-shadow"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2633.5804326227!2d17.1234!3d48.8567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDUxJzI0LjEiTiAxN8KwMDcnMjQuMiJF!5e0!3m2!1sen!2scz!4v1620000000000!5m2!1sen!2scz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa salonu"
                ></iframe>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 bg-[#a89b84]/10 text-[#3a3a3a]">
          <div className="container mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div>
                <h5 className="text-2xl uppercase font-light tracking-wider mb-8">Spojte se s námi</h5>
                <div className="flex gap-6 mb-8">
                  <Link href="https://www.instagram.com/_madero_therapy_/" target="_blank" rel="noopener noreferrer" className="text-[#a89b84] hover:text-[#8c8270] transition-colors">
                    <Instagram className="h-6 w-6" />
                  </Link>
                  <Link href="https://www.facebook.com/maderotherapybyeliceli/" target="_blank" rel="noopener noreferrer" className="text-[#a89b84] hover:text-[#8c8270] transition-colors">
                    <Facebook className="h-6 w-6" />
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-[#a89b84]" />
                    <p>Otevírací doba 9:00 - 19:00</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-[#a89b84]" />
                    <p>info@madero-therapy.cz</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-[#a89b84]" />
                    <p>Národní třída 123, Hodonín</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-[#a89b84]" />
                    <p>+420 777 888 999</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-2xl uppercase font-light tracking-wider mb-8">Rezervace</h5>
                <p className="mb-6">
                  Vaše zdraví začíná zde. Udělejte první krok k lepšímu pocitu ve vašem těle a rezervujte si termín ještě
                  dnes.
                </p>
                <BookingForm />
              </div>
            </div>

            <div className="border-t border-[#a89b84]/20 mt-12 pt-8 text-center">
              <p className="text-sm text-[#5a5a5a]">
                © {new Date().getFullYear()} Eliška Tomalová. Všechna práva vyhrazena.
              </p>
            </div>
          </div>
        </footer>

        {/* Toast provider */}
        <Toaster />
      </main>
    </SidebarProvider>
  )
}

function BeforeAfterSlider() {
  return (
    <div className="w-full max-w-md mx-auto h-[300px] overflow-hidden flex items-center justify-center">
      <ReactCompareImage
        leftImage="/images/slider/before.jpg"
        rightImage="/images/slider/after.jpg"
        sliderLineWidth={2}
        sliderLineColor="#000"
        handleSize={40}
      />
    </div>
  )
}
