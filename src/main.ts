import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { MemoriaDb } from './database/memoria-db.js';
import type { Prioridad, EstadoIncidente } from './interfaces/incidente.interface.js';
import type { CreateIncidenteDto } from './dtos/create-incidente.dto.js';

/**
 * Punto de entrada principal de la aplicación CLI.
 * Controla el menú interactivo para el reporte de incidentes en el Laboratorio C-27.
 */
async function main() {
  const db = new MemoriaDb();
  const rl = createInterface({ input, output });

  console.clear();
  console.log('      SISTEMA DE REPORTE DE INCIDENTES - SOPORTE TICS [LAB C-27]      ');

  try {
    let activo = true;
    while (activo) {
      console.log('----------------------------------------------------------------------');
      console.log('Seleccione una opción:');
      console.log('  1. Reportar nuevo incidente en el C-27');
      console.log('  2. Ver todos los incidentes reportados');
      console.log('  3. Cambiar estado de un incidente');
      console.log('  4. Salir del programa');
      console.log('----------------------------------------------------------------------');

      const opcion = (await rl.question('Selección > ')).trim();

      switch (opcion) {
        case '1': {
          console.log('\n--- REPORTAR NUEVO INCIDENTE ---');

          let titulo = '';
          while (!titulo) {
            titulo = (await rl.question('Título del incidente: ')).trim();
            if (!titulo) {
              console.log('El título no puede estar vacío. Intente de nuevo.');
            }
          }

          let descripcion = '';
          while (!descripcion) {
            descripcion = (await rl.question('Descripción detallada del problema: ')).trim();
            if (!descripcion) {
              console.log('La descripción no puede estar vacía. Intente de nuevo.');
            }
          }

          let reportadoPor = '';
          while (!reportadoPor) {
            reportadoPor = (await rl.question('Nombre o ID de quien reporta: ')).trim();
            if (!reportadoPor) {
              console.log('El nombre de quien reporta es obligatorio. Intente de nuevo.');
            }
          }

          let prioridad: Prioridad | null = null;
          while (!prioridad) {
            console.log('\nSeleccione el nivel de prioridad:');
            console.log('  1. alta');
            console.log('  2. media');
            console.log('  3. baja');
            const seleccionPrioridad = (await rl.question('Selección [1-3] o texto: ')).trim().toLowerCase();

            if (seleccionPrioridad === '1' || seleccionPrioridad === 'alta') {
              prioridad = 'alta';
            } else if (seleccionPrioridad === '2' || seleccionPrioridad === 'media') {
              prioridad = 'media';
            } else if (seleccionPrioridad === '3' || seleccionPrioridad === 'baja') {
              prioridad = 'baja';
            } else {
              console.log('Prioridad inválida. Debe ingresar 1, 2, 3 o el texto (alta, media, baja).');
            }
          }

          const dto: CreateIncidenteDto = {
            titulo,
            descripcion,
            reportadoPor,
            prioridad
          };

          const nuevoIncidente = db.crearIncidente(dto);

          console.log('\n¡Incidente reportado y guardado con éxito!');
          console.log(`   ID:             ${nuevoIncidente.id}`);
          console.log(`   Título:         ${nuevoIncidente.titulo}`);
          console.log(`   Reportado Por:  ${nuevoIncidente.reportadoPor}`);
          console.log(`   Prioridad:      ${nuevoIncidente.prioridad.toUpperCase()}`);
          console.log(`   Estado Inicial: ${nuevoIncidente.estado.toUpperCase()}`);
          console.log(`   Fecha Creación: ${nuevoIncidente.fechaCreacion.toLocaleString()}\n`);
          break;
        }

        case '2': {
          console.log('\n--- TODOS LOS INCIDENTES REPORTADOS (C-27) ---');
          const incidentes = db.obtenerTodos();

          if (incidentes.length === 0) {
            console.log('No hay incidentes registrados en el sistema actualmente.\n');
            break;
          }

          console.log(`Se encontraron ${incidentes.length} incidente(s):\n`);

          incidentes.forEach((inc, index) => {
            console.log(`  [${index + 1}] ID: ${inc.id}`);
            console.log(`      Título:        ${inc.titulo}`);
            console.log(`      Descripción:   ${inc.descripcion}`);
            console.log(`      Reportado por: ${inc.reportadoPor}`);
            console.log(`      Prioridad:     ${inc.prioridad.toUpperCase()}`);
            console.log(`      Estado:        ${inc.estado.toUpperCase()}`);
            console.log(`      Fecha:         ${inc.fechaCreacion.toLocaleString()}`);
            console.log('      ' + '-'.repeat(50));
          });
          console.log();
          break;
        }

        case '3': {
          console.log('\n--- CAMBIAR ESTADO DE INCIDENTE ---');
          const incidentes = db.obtenerTodos();
          if (incidentes.length === 0) {
            console.log('No hay incidentes reportados para modificar su estado.\n');
            break;
          }

          const idBuscado = (await rl.question('Ingrese el ID del incidente a actualizar: ')).trim();
          const incidenteExiste = incidentes.some((inc) => inc.id === idBuscado);

          if (!incidenteExiste) {
            console.log(`No se encontró ningún incidente con el ID "${idBuscado}".\n`);
            break;
          }

          let nuevoEstado: EstadoIncidente | null = null;
          while (!nuevoEstado) {
            console.log('\nSeleccione el nuevo estado:');
            console.log('  1. abierto');
            console.log('  2. en proceso');
            console.log('  3. cerrado');
            const seleccionEstado = (await rl.question('Selección [1-3] o texto: ')).trim().toLowerCase();

            if (seleccionEstado === '1' || seleccionEstado === 'abierto') {
              nuevoEstado = 'abierto';
            } else if (seleccionEstado === '2' || seleccionEstado === 'en proceso') {
              nuevoEstado = 'en proceso';
            } else if (seleccionEstado === '3' || seleccionEstado === 'cerrado') {
              nuevoEstado = 'cerrado';
            } else {
              console.log('Estado inválido. Debe ingresar 1, 2, 3 o el texto (abierto, en proceso, cerrado).');
            }
          }

          const incidenteActualizado = db.actualizarEstado(idBuscado, nuevoEstado);

          if (incidenteActualizado) {
            console.log('\n¡Estado del incidente actualizado con éxito!');
            console.log(`   ID:             ${incidenteActualizado.id}`);
            console.log(`   Título:         ${incidenteActualizado.titulo}`);
            console.log(`   Nuevo Estado:   ${incidenteActualizado.estado.toUpperCase()}\n`);
          } else {
            console.log('Ocurrió un error inesperado al actualizar el estado.\n');
          }
          break;
        }

        case '4': {
          console.log('\nCerrando interfaz de soporte TICS. ¡Hasta pronto!\n');
          activo = false;
          break;
        }

        default: {
          console.log('\nOpción no válida. Por favor, seleccione 1, 2, 3 o 4.\n');
          break;
        }
      }
    }
  } catch (error) {
    console.error('Ocurrió un error inesperado durante la ejecución:', error);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('Error crítico al iniciar la aplicación:', error);
});
