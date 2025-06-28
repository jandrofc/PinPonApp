import { Component, OnInit } from '@angular/core';

import { ModalController, ToastController, AlertController } from "@ionic/angular"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"


import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { OutputsEmergentesService } from '../../services/outputs-emergentes/outputs-emergentes.service';
import { ConexionBackendService } from 'src/app/services/conexion-backend.service';

import { addIcons  } from 'ionicons';
import { alertCircle, checkmark, checkmarkCircle, globeOutline, 
  helpCircleOutline, informationCircleOutline, 
  refreshOutline, wifi, saveOutline,
  closeCircle} from 'ionicons/icons'
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-ipv4',
  standalone: true,
  templateUrl: './ipv4.component.html',
  styleUrls: ['./ipv4.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule,ReactiveFormsModule]
})
export class Ipv4Component  implements OnInit {
ipForm: FormGroup
commonIPs: string[] = ["192.168.1.87","192.168.100.73","192.168.1.133"]
isValid = false
constructor(

    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController,
    private OutPuts_Emergentes: OutputsEmergentesService,
    private configService: ConfigService
  ) {
    addIcons({
      "close-circle": closeCircle,
      "wifi": wifi,
      "globe-outline": globeOutline,
      "checkmark-circle": checkmarkCircle,
      "alert-circle": alertCircle,
      "information-circle-outline": informationCircleOutline,
      "checkmark": checkmark,
      "help-circle-outline": helpCircleOutline,
      "refresh-outline": refreshOutline,
      "save-outline": saveOutline
    });


    this.ipForm = this.formBuilder.group({
      ipAddress: ["", [Validators.required, this.ipv4Validator]],
    })
  }
  

  ngOnInit() {
    // Escuchar cambios en el formulario para validación en tiempo real
    this.ipForm.get("ipAddress")?.valueChanges.subscribe((value) => {
      this.isValid = this.ipForm.get("ipAddress")?.valid || false
    })
  }

  // Validador personalizado para IPv4
  ipv4Validator(control: any) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (control.value && !ipv4Regex.test(control.value)) {
      return { invalidIpv4: true }
    }
    return null
  }

  // Seleccionar IP común
  selectCommonIP(ip: string) {
    this.ipForm.patchValue({ ipAddress: ip })
  }

  // Limpiar formulario
  clearForm() {
    this.ipForm.reset()
  }

  // Mostrar información sobre IPv4
  async showInfo() {
    const alert = await this.alertController.create({
      header: "Información IPv4",
      message: `
        <p><strong>Formato válido:</strong></p>
        <ul>
          <li>4 números separados por puntos</li>
          <li>Cada número entre 0 y 255</li>
          <li>Ejemplo: 192.168.1.100</li>
        </ul>
      `,
      buttons: ["Entendido"],
    })
    await alert.present()
  }

  // Guardar configuración
  async saveConfiguration() {
    if (this.ipForm.valid) {
      const ipAddress = this.ipForm.get("ipAddress")?.value


      this.configService.setApiUrl(`http://${ipAddress}:3000/api/`);




      // Mostrar toast de confirmación
      const toast = await this.toastController.create({
        message: `IP ${ipAddress} configurada correctamente`,
        duration: 2000,
        color: "success",
        position: "top",
      })
      await toast.present()

      // Cerrar modal y devolver la IP
      this.OutPuts_Emergentes.dismissModal({
      })
    }
  }



public async closeModal(): Promise<void> {
      this.OutPuts_Emergentes.dismissModal({
        
      });
    }
  
}

