# Diagrama de Funcionamiento: Sistema de Incidentes C-27

Este documento presenta la arquitectura modular y el flujo de ejecución interactivo del sistema de reportes de soporte para el laboratorio C-27.

---

## 1. Arquitectura de Módulos (Clean Architecture)

El proyecto sigue una estructura desacoplada donde la interfaz de usuario (CLI) no accede a estructuras de datos rígidas directas, sino que se comunica mediante **DTOs** e **Interfaces** con la base de datos en memoria (`MemoriaDb`).

```mermaid
graph TD
    subgraph UI ["Capa de Presentación (CLI)"]
        main["main.ts<br>(readline/promises)"]
    end

    subgraph DTO ["Capa de Transferencia"]
        dto["CreateIncidenteDto"]
    end

    subgraph DB ["Capa de Datos"]
        memdb["MemoriaDb<br>(Almacenamiento en memoria)"]
    end

    subgraph Domain ["Capa de Dominio"]
        int["Incidente (Interfaz)"]
        prio["Prioridad (Tipo de Unión)"]
        est["EstadoIncidente (Tipo de Unión)"]
    end

    main -->|Usa| dto
    main -->|Interactúa| memdb
    dto -->|Valida| prio
    memdb -->|Genera y Retorna| int
    int -->|Contiene| prio
    int -->|Contiene| est
```

---

## 2. Diagrama de Flujo de Operaciones (CLI Loop)

El siguiente diagrama detalla cómo se comporta la aplicación durante la ejecución del bucle interactivo de consola:

```mermaid
flowchart TD
    Start([Inicio: pnpm start]) --> Clear[Limpiar consola y mostrar banner]
    Clear --> ShowMenu[Mostrar Menú Principal:<br>1. Reportar incidente<br>2. Ver incidentes<br>3. Cambiar estado<br>4. Salir]
    ShowMenu --> ReadOpt[/Esperar entrada del usuario/]
    
    ReadOpt --> CheckOpt{¿Qué opción seleccionó?}

    %% Opción 1: Reportar
    CheckOpt -->|Opción 1| ReqInputs[Solicitar datos del incidente]
    ReqInputs --> ValTitle{¿Título vacío?}
    ValTitle -->|Sí| ReqInputs
    ValTitle -->|No| ReqDesc{¿Descripción vacía?}
    ReqDesc -->|Sí| ReqInputs
    ReqDesc -->|No| ReqPrio{¿Prioridad válida?}
    ReqPrio -->|No| ReqInputs
    ReqPrio -->|Sí| CallCreate[Llamar a crearIncidente DTO]
    CallCreate --> DBInsert[Generar ID incremental + Fecha + Estado: abierto<br>Guardar en memoria]
    DBInsert --> PrintSuccess[Mostrar confirmación con ID asignado]
    PrintSuccess --> ShowMenu

    %% Opción 2: Listar
    CheckOpt -->|Opción 2| ReadDB[Llamar a obtenerTodos]
    ReadDB --> CheckEmpty{¿Hay incidentes?}
    CheckEmpty -->|No| PrintEmpty[Mostrar: No hay incidentes]
    CheckEmpty -->|Sí| PrintList[Imprimir lista formateada por ID]
    PrintEmpty --> ShowMenu
    PrintList --> ShowMenu

    %% Opción 3: Actualizar Estado
    CheckOpt -->|Opción 3| ReqID[Solicitar ID del incidente]
    ReqID --> FindID{¿Existe el ID?}
    FindID -->|No| PrintErr[Mostrar: ID no encontrado]
    FindID -->|Sí| SubMenu[Mostrar submenú de Estados:<br>1. abierto, 2. en proceso, 3. cerrado]
    SubMenu --> CallUpdate[Llamar a actualizarEstado ID, nuevoEstado]
    CallUpdate --> PrintUpdate[Mostrar confirmación de estado cambiado]
    PrintErr --> ShowMenu
    PrintUpdate --> ShowMenu

    %% Opción 4: Salir
    CheckOpt -->|Opción 4| ExitApp[Mostrar despedida y cerrar readline]
    ExitApp --> End([Fin de ejecución])

    %% Opción inválida
    CheckOpt -->|Otro valor| PrintInvalid[Mostrar error de selección]
    PrintInvalid --> ShowMenu
```
