CREATE TABLE "Usuario" (
  "id"              SERIAL PRIMARY KEY,
  "nombre"          VARCHAR(120) NOT NULL,
  "correo"          VARCHAR(180) NOT NULL UNIQUE,
  "telefono"        VARCHAR(40)  NOT NULL DEFAULT '',
  "esConductor"     BOOLEAN      NOT NULL DEFAULT FALSE,
  "placa"           VARCHAR(20),
  "marcaVehiculo"   VARCHAR(60),
  "modeloVehiculo"  VARCHAR(60),
  "colorVehiculo"   VARCHAR(40),
  "puestosVehiculo" INTEGER,
  "creadoEn"        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE "Viaje" (
  "id"                  SERIAL PRIMARY KEY,
  "origen"              VARCHAR(200) NOT NULL,
  "destino"             VARCHAR(200) NOT NULL,
  "puntoEncuentro"      VARCHAR(200),
  "fecha"               VARCHAR(20)  NOT NULL,
  "hora"                VARCHAR(10)  NOT NULL,
  "cuposTotal"          INTEGER      NOT NULL,
  "cuposDisponibles"    INTEGER      NOT NULL,
  "descripcionVehiculo" VARCHAR(200) NOT NULL,
  "estado"              VARCHAR(40)  NOT NULL DEFAULT 'disponible',
  "origenLat"           DOUBLE PRECISION,
  "origenLng"           DOUBLE PRECISION,
  "destinoLat"          DOUBLE PRECISION,
  "destinoLng"          DOUBLE PRECISION,
  "creadoEn"            TIMESTAMP    NOT NULL DEFAULT NOW(),
  "idConductor"         INTEGER      NOT NULL,
  CONSTRAINT "Viaje_idConductor_fkey"
    FOREIGN KEY ("idConductor") REFERENCES "Usuario"("id")
);

CREATE TABLE "PasajeroViaje" (
  "id"        SERIAL PRIMARY KEY,
  "unidoEn"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "idUsuario" INTEGER   NOT NULL,
  "idViaje"   INTEGER   NOT NULL,
  CONSTRAINT "PasajeroViaje_idUsuario_fkey"
    FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id"),
  CONSTRAINT "PasajeroViaje_idViaje_fkey"
    FOREIGN KEY ("idViaje") REFERENCES "Viaje"("id"),
  CONSTRAINT "PasajeroViaje_usuario_viaje_unique"
    UNIQUE ("idUsuario", "idViaje")
);
