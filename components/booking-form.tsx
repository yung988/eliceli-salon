"use client"

import { useState, useEffect } from "react"
import { format, addDays, isBefore } from "date-fns"
import { cs } from "date-fns/locale"
import { CalendarIcon, Check, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createBooking, getServices, getAvailableTimeSlots } from "@/app/actions/booking-actions"

const formSchema = z.object({
  service: z.string({
    required_error: "Prosím vyberte službu",
  }),
  date: z.date({
    required_error: "Prosím vyberte datum",
  }),
  time: z.string({
    required_error: "Prosím vyberte čas",
  }),
  name: z.string().min(2, {
    message: "Jméno musí obsahovat alespoň 2 znaky",
  }),
  email: z.string().email({
    message: "Prosím zadejte platný email",
  }),
  phone: z.string().min(9, {
    message: "Prosím zadejte platné telefonní číslo",
  }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type Service = {
  id: number
  name: string
  description: string
  duration: number
  price: number
}

// Business hours
const businessHours = {
  1: { start: 9, end: 19 }, // Monday
  2: { start: 9, end: 19 }, // Tuesday
  3: { start: 9, end: 19 }, // Wednesday
  4: { start: 9, end: 19 }, // Thursday
  5: { start: 9, end: 19 }, // Friday
  6: { start: 9, end: 14 }, // Saturday
  0: { start: 0, end: 0 }, // Sunday - closed
}

export function BookingForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  })

  const watchDate = form.watch("date")
  const watchService = form.watch("service")

  // Fetch services from the database
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true)
      try {
        const response = await getServices()
        if (response.success) {
          setServices(response.services)
        } else {
          toast({
            title: "Error",
            description: "Failed to load services. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching services:", error)
        toast({
          title: "Error",
          description: "Failed to load services. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  // Update service details when service changes
  useEffect(() => {
    if (watchService && services.length > 0) {
      const service = services.find((s) => s.id.toString() === watchService) || null
      setSelectedService(service)
    }
  }, [watchService, services])

  // Fetch available times when date or service changes
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (watchDate && watchService) {
        setIsLoadingTimes(true)
        try {
          const formattedDate = format(watchDate, "yyyy-MM-dd")
          const response = await getAvailableTimeSlots(formattedDate, Number.parseInt(watchService))

          if (response.success) {
            setAvailableTimes(response.timeSlots)

            // Reset time selection if previously selected time is no longer available
            const currentTime = form.getValues("time")
            if (currentTime && !response.timeSlots.includes(currentTime)) {
              form.setValue("time", "")
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to load available times. Please try again later.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching available times:", error)
          toast({
            title: "Error",
            description: "Failed to load available times. Please try again later.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingTimes(false)
        }
      }
    }

    fetchAvailableTimes()
  }, [watchDate, watchService, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      // Create FormData object
      const formData = new FormData()
      formData.append("service", values.service)
      formData.append("date", format(values.date, "yyyy-MM-dd"))
      formData.append("time", values.time)
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("phone", values.phone)
      if (values.notes) {
        formData.append("notes", values.notes)
      }

      // Submit booking
      const response = await createBooking(formData)

      if (response.success) {
        setStep(3) // Move to confirmation step

        // Show success toast
        toast({
          title: "Rezervace byla úspěšně odeslána",
          description: `Děkujeme za Vaši rezervaci na ${format(values.date, "EEEE d. MMMM yyyy", { locale: cs })} v ${values.time}. Brzy Vás budeme kontaktovat pro potvrzení.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Chyba",
          description: "Nepodařilo se vytvořit rezervaci. Prosím zkuste to znovu později.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit rezervaci. Prosím zkuste to znovu později.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Reset form after dialog closes
    setTimeout(() => {
      form.reset()
      setStep(1)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#a89b84] hover:bg-[#8c8270] text-white uppercase tracking-wider text-xs px-8 py-6">
          Rezervovat termín
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-[#f8f5f2]">
        <div className="relative">
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#e8e0d5]">
            <div
              className="h-full bg-[#a89b84] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl md:text-3xl uppercase font-light tracking-wider text-center">
              {step === 1 && "Rezervace termínu"}
              {step === 2 && "Vaše kontaktní údaje"}
              {step === 3 && "Rezervace potvrzena"}
            </DialogTitle>
            <DialogDescription className="text-center text-[#5a5a5a] mt-2">
              {step === 1 && "Vyberte službu, datum a čas, který vám vyhovuje"}
              {step === 2 && "Vyplňte své kontaktní údaje pro dokončení rezervace"}
              {step === 3 && "Děkujeme za vaši rezervaci"}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">Služba</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Reset time when service changes
                              form.setValue("time", "")
                            }}
                            value={field.value}
                            disabled={isLoadingServices}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue
                                  placeholder={isLoadingServices ? "Načítání služeb..." : "Vyberte službu"}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  {service.name.includes("vstupů")
                                    ? `${service.name} - ${service.price} Kč (balíček)`
                                    : `${service.name} (${service.duration} min) - ${service.price} Kč`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedService && (
                      <div className="bg-white/70 p-4 rounded-lg text-sm text-[#5a5a5a] flex items-start gap-2">
                        <Info className="h-5 w-5 text-[#a89b84] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium uppercase tracking-wider text-xs text-[#3a3a3a] mb-1">
                            {selectedService.name}
                          </p>
                          <p>{selectedService.description}</p>
                          <p className="mt-1">
                            {selectedService.name.includes("vstupů")
                              ? "Balíček více ošetření"
                              : `Délka ošetření: ${selectedService.duration} minut`}
                          </p>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">Datum</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal bg-white",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "EEEE d. MMMM yyyy", { locale: cs })
                                  ) : (
                                    <span>Vyberte datum</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date)
                                  // Reset time when date changes
                                  form.setValue("time", "")
                                }}
                                disabled={(date) => {
                                  // Disable past dates and Sundays
                                  return isBefore(date, new Date()) || date.getDay() === 0
                                }}
                                initialFocus
                                locale={cs}
                                fromDate={new Date()}
                                toDate={addDays(new Date(), 60)}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">Čas</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!watchDate || !watchService || isLoadingTimes}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder={isLoadingTimes ? "Načítání časů..." : "Vyberte čas"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingTimes ? (
                                <div className="p-2 text-center text-sm text-[#5a5a5a]">
                                  Načítání dostupných časů...
                                </div>
                              ) : availableTimes.length > 0 ? (
                                availableTimes.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-sm text-[#5a5a5a]">
                                  {watchDate && watchService ? "Žádné volné termíny" : "Nejprve vyberte službu a datum"}
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="border-[#a89b84] text-[#a89b84] hover:bg-[#a89b84] hover:text-white uppercase tracking-wider text-xs"
                      >
                        Zrušit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          const result = form.trigger(["service", "date", "time"])
                          if (result) {
                            setStep(2)
                          }
                        }}
                        className="bg-[#a89b84] hover:bg-[#8c8270] text-white uppercase tracking-wider text-xs"
                      >
                        Pokračovat
                      </Button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="bg-white/70 p-4 rounded-lg mb-6">
                      <h4 className="uppercase tracking-wider text-xs font-medium text-[#3a3a3a] mb-2">
                        Shrnutí rezervace
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-[#5a5a5a]">Služba:</div>
                        <div>{selectedService?.name}</div>
                        <div className="text-[#5a5a5a]">Datum:</div>
                        <div>{watchDate ? format(watchDate, "EEEE d. MMMM yyyy", { locale: cs }) : ""}</div>
                        <div className="text-[#5a5a5a]">Čas:</div>
                        <div>{form.getValues("time")}</div>
                        <div className="text-[#5a5a5a]">Délka:</div>
                        <div>{selectedService?.duration} minut</div>
                        <div className="text-[#5a5a5a]">Cena:</div>
                        <div>{selectedService?.price} Kč</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">
                              Jméno a příjmení
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Zadejte své jméno" {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">Telefon</FormLabel>
                            <FormControl>
                              <Input placeholder="+420 xxx xxx xxx" {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="vas@email.cz" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3a3a3a] uppercase tracking-wider text-xs">
                            Poznámka (nepovinné)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Máte nějaké speciální požadavky nebo zdravotní omezení?"
                              className="resize-none bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Prosím uveďte jakékoliv důležité informace, které bychom měli vědět před ošetřením.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="border-[#a89b84] text-[#a89b84] hover:bg-[#a89b84] hover:text-white uppercase tracking-wider text-xs"
                      >
                        Zpět
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#a89b84] hover:bg-[#8c8270] text-white uppercase tracking-wider text-xs"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Odesílám...
                          </>
                        ) : (
                          "Dokončit rezervaci"
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-16 h-16 bg-[#a89b84]/20 rounded-full flex items-center justify-center mb-6">
                      <Check className="h-8 w-8 text-[#a89b84]" />
                    </div>
                    <h3 className="text-xl uppercase font-light tracking-wider mb-2">
                      Rezervace byla úspěšně odeslána
                    </h3>
                    <p className="text-center text-[#5a5a5a] mb-6">
                      Děkujeme za Vaši rezervaci na{" "}
                      {watchDate ? format(watchDate, "EEEE d. MMMM yyyy", { locale: cs }) : ""} v{" "}
                      {form.getValues("time")}.
                      <br />
                      Brzy Vás budeme kontaktovat pro potvrzení.
                    </p>
                    <div className="bg-white/70 p-4 rounded-lg w-full max-w-md mb-6">
                      <h4 className="uppercase tracking-wider text-xs font-medium text-[#3a3a3a] mb-2">
                        Detaily rezervace
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-[#5a5a5a]">Služba:</div>
                        <div>{selectedService?.name}</div>
                        <div className="text-[#5a5a5a]">Datum:</div>
                        <div>{watchDate ? format(watchDate, "EEEE d. MMMM yyyy", { locale: cs }) : ""}</div>
                        <div className="text-[#5a5a5a]">Čas:</div>
                        <div>{form.getValues("time")}</div>
                        <div className="text-[#5a5a5a]">Jméno:</div>
                        <div>{form.getValues("name")}</div>
                        <div className="text-[#5a5a5a]">Telefon:</div>
                        <div>{form.getValues("phone")}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleClose}
                      className="bg-[#a89b84] hover:bg-[#8c8270] text-white uppercase tracking-wider text-xs"
                    >
                      Zavřít
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
