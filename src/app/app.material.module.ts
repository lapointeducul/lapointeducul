import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule
} from '@angular/material';

const MATERIAL_MODULES = [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatProgressBarModule,
];

@NgModule({
    imports: [...MATERIAL_MODULES],
    exports: [...MATERIAL_MODULES],
})
export class AppMaterialModule { }
