"use client"

import { useState } from "react"
import { Plus, Image as ImageIcon, Loader2, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

type DBProperty = {
  id: string
  project_id: string | null
  code: string | null
  title: string | null
  description: string | null
  property_type: string | null
  location: string | null
  area: number | null
  price: number | null
  status: string | null
  image_url?: string | null
  projects?: { name: string | null } | null
}

export function TerrenosList({ 
  initialProperties, 
  projects,
  userRole
}: { 
  initialProperties: DBProperty[], 
  projects: { id: string, name: string | null }[],
  userRole: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Form state
  const [projectId, setProjectId] = useState("")
  const [code, setCode] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [propertyType, setPropertyType] = useState("Lote")
  const [location, setLocation] = useState("")
  const [area, setArea] = useState("")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState("Disponible")
  
  const router = useRouter()
  const supabase = createClient()
  const canCreate = userRole === "ADMIN" || userRole === "SUPER_ADMIN"

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    let imageUrl = null
    
    // Subir imagen si existe
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `terrenos/${fileName}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('terrenos') // Bucket creado por el usuario
        .upload(filePath, imageFile)
        
      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        alert("Error al subir la imagen. Verifica que el bucket 'terrenos' existe y es público.")
        setIsSubmitting(false)
        return
      }
      
      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('terrenos')
        .getPublicUrl(filePath)
        
      imageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from("properties").insert([
      {
        project_id: projectId || null,
        code,
        title,
        description,
        property_type: propertyType,
        location,
        area: area ? parseFloat(area) : null,
        price: price ? parseFloat(price) : null,
        status,
        image_url: imageUrl
      }
    ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error creating property:", error)
      alert("Error al registrar: " + error.message)
    } else {
      setIsOpen(false)
      // Reset form
      setProjectId("")
      setCode("")
      setTitle("")
      setDescription("")
      setLocation("")
      setArea("")
      setPrice("")
      setImageFile(null)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Catálogo de Terrenos</h2>
          <p className="text-sm text-muted-foreground">Explora las propiedades y lotes disponibles.</p>
        </div>
        
        {canCreate && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-500 text-white hover:bg-brand-600">
                <Plus className="h-4 w-4 mr-2" /> Registrar Terreno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Terreno</DialogTitle>
                <DialogDescription>Añade un nuevo lote o propiedad al catálogo.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProperty} className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Imagen principal</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proyecto</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Código (Ej. LOTE-01)</Label>
                    <Input required value={code} onChange={e => setCode(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Título / Nombre corto</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label>Ubicación exacta</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Área (m²)</Label>
                    <Input type="number" required value={area} onChange={e => setArea(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio (S/ o USD)</Label>
                    <Input type="number" required value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lote">Lote / Terreno</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Departamento">Departamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialProperties.map((prop) => (
          <Card key={prop.id} className="overflow-hidden border-border/60 transition-all hover:border-brand-200 hover:shadow-md dark:hover:border-brand-500/40">
            <div className="aspect-video w-full bg-muted relative">
              {prop.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={prop.image_url} alt={prop.title || "Terreno"} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground opacity-50">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge className={
                  prop.status === "Disponible" 
                    ? "bg-success hover:bg-success/90 text-white border-none shadow-sm"
                    : prop.status === "Vendido"
                      ? "bg-destructive hover:bg-destructive/90 text-white border-none shadow-sm"
                      : "bg-warning hover:bg-warning/90 text-white border-none shadow-sm"
                }>
                  {prop.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {prop.projects?.name || "Sin Proyecto"}
                </p>
                <h3 className="font-medium text-foreground text-lg line-clamp-1">{prop.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {prop.location || "Ubicación no especificada"}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Área</p>
                  <p className="font-medium">{prop.area ? `${prop.area} m²` : "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Precio</p>
                  <p className="font-bold text-brand-600 dark:text-brand-300">
                    {prop.price ? `S/ ${prop.price.toLocaleString("es-PE")}` : "Consultar"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {initialProperties.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No hay propiedades en el catálogo.
          </div>
        )}
      </div>
    </div>
  )
}
