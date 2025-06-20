-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-06-2025 a las 04:06:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `prueba`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id` int(11) NOT NULL,
  `id_venta` int(11) DEFAULT NULL,
  `id_formato_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id`, `id_venta`, `id_formato_producto`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 12, 1, 2000.00),
(2, 2, 13, 6, 3000.00),
(3, 3, 13, 6, 3000.00),
(4, 4, 13, 2, 3000.00),
(7, 7, 13, 1, 3000.00),
(8, 8, 14, 46, 1500.00),
(9, 9, 19, 37, 2500.00),
(10, 10, 19, 1, 2500.00),
(11, 11, 19, 1, 2500.00),
(12, 12, 19, 10, 2500.00),
(13, 13, 19, 2, 2500.00),
(14, 14, 19, 1, 2500.00),
(15, 15, 19, 17, 2500.00),
(16, 16, 19, 1, 2500.00),
(17, 17, 19, 1, 2500.00),
(18, 18, 19, 2, 2500.00),
(19, 19, 19, 12, 2500.00),
(20, 20, 19, 2, 2500.00),
(21, 21, 19, 1, 2500.00),
(22, 22, 19, 12, 2500.00),
(23, 23, 19, 1, 2500.00),
(24, 24, 19, 1, 2500.00),
(25, 25, 19, 1, 2500.00),
(26, 26, 19, 3, 2500.00),
(27, 27, 19, 1, 2500.00),
(28, 28, 19, 3, 2500.00),
(29, 29, 19, 1, 2500.00),
(30, 30, 19, 2, 2500.00),
(31, 31, 19, 5, 2500.00),
(32, 32, 19, 2, 2500.00),
(33, 33, 19, 1, 2500.00),
(35, 35, 19, 1, 2500.00),
(36, 36, 19, 4, 2500.00),
(37, 37, 19, 1, 2500.00),
(38, 38, 19, 3, 2500.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fcm_tokens`
--

CREATE TABLE `fcm_tokens` (
  `token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `fcm_tokens`
--

INSERT INTO `fcm_tokens` (`token`) VALUES
('ce6quGjvSEKL14oSPS1IZJ:APA91bFxFwn8JcVXJ0-9f4nixjLlmqE1zXXd8-L31OfJeES6QiKXNuC5xFcPsvU8HizJ5-LS9n_83Jq4IwZvSwE63hdy9FgUr-01QQ1dMaFR8Rvyl5JPruI'),
('d1loKz11SGKRk5fBQfUSn0:APA91bEuBh0A-gDBegIpJxKhgT3Zdmd9OBbOFIlqdRHKnFIt-WRIXDOw2a0lbfC7ytTboRo_HU5Mo38M-Hicp_qOv4kwk5teZUJsadd2023T10gfdeN2NV4'),
('e0UJw0N2Q4KvGJtWrAaPzZ:APA91bGzDUCs8_S4RyrsUuq1SeNpP2xRPdCZ6iVBYBbrmc0u4qg0U4GK4dA0rpv4toOyZP07QZjyOYjX1FrUaPEl_EHkFFBJHxQ8v-QWVWnLi6XFknVlAyk'),
('feyxXEUpTMiR1Vooi0BGti:APA91bH8ECVdWI83KmVJ2KdYG-EtWm0GoxldF6hRIZRVpIibGDmIpuOL0PuStHM9nN6b7H40EnyAjE1zmKFPirZNoLXWB0-ZTj1FnDnO04jIoGkqHUhhQxI');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formato_producto`
--

CREATE TABLE `formato_producto` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `formato` varchar(100) NOT NULL,
  `cantidad` int(11) DEFAULT 0,
  `codigo_barra` varchar(50) NOT NULL,
  `precio` int(10) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizado` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `habilitado` tinyint(1) DEFAULT 1,
  `stock_min` int(11) DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `formato_producto`
--

INSERT INTO `formato_producto` (`id`, `producto_id`, `formato`, `cantidad`, `codigo_barra`, `precio`, `fecha_creacion`, `fecha_actualizado`, `habilitado`, `stock_min`) VALUES
(1, 1, '1 Litro', 50, '7891234560011', 1200, '2025-05-03 21:22:52', '2025-05-03 21:22:52', 1, 5),
(2, 1, '500 ml', 30, '7891234560012', 800, '2025-05-03 21:22:52', '2025-05-03 21:22:52', 1, 5),
(3, 2, '500g', 40, '7891234560021', 2200, '2025-05-03 21:22:52', '2025-05-03 21:22:52', 1, 5),
(4, 2, '250g', 25, '7891234560022', 1500, '2025-05-03 21:22:52', '2025-05-09 00:24:24', 0, 5),
(5, 3, '200g', 50, '7891234560031', 1000, '2025-05-03 21:22:52', '2025-05-04 20:06:01', 1, 5),
(6, 3, '12321', 100, '7891234560032', 1, '2025-05-03 21:22:52', '2025-05-27 00:27:08', 1, 5),
(7, 4, '10 Litro', 800, '7891234560041', 1599, '2025-05-03 21:22:52', '2025-05-10 17:30:12', 0, 5),
(8, 5, '1.5 Litros', 150, '7891234560051', 1000, '2025-05-03 21:22:52', '2025-05-18 20:29:39', 0, 5),
(9, 6, 'Paquete', 20, '1234567890123', 1500, '2025-05-06 00:34:26', '2025-05-18 20:29:50', 0, 5),
(10, 1, 'Paquete', 20, '1234567890145', 1500, '2025-05-06 00:35:19', '2025-05-06 00:35:19', 1, 5),
(11, 7, '130g', 4, '7891000384152', 1500, '2025-05-28 02:41:06', '2025-05-28 02:44:54', 1, 5),
(12, 8, '160g', 1, '614143259265', 2000, '2025-05-28 02:44:54', '2025-05-30 02:38:57', 1, 5),
(13, 9, '370g', 10, '7804612222033', 3000, '2025-05-28 02:44:54', '2025-06-07 16:03:35', 1, 5),
(14, 10, '1k', 4, '7613035794344', 1500, '2025-05-28 22:48:52', '2025-06-07 14:56:37', 1, 5),
(15, 11, '1l', 1, '070847009511', 2000, '2025-05-28 23:29:00', '2025-05-28 23:29:32', 0, 5),
(19, 15, '1k', 26, '7802800533572', 2500, '2025-06-07 15:59:54', '2025-06-10 01:52:10', 1, 6),
(20, 16, '1k', 16, '7804910019434', 3000, '2025-06-10 01:54:09', '2025-06-10 01:54:09', 1, 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `producto` varchar(255) NOT NULL,
  `marca` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizado` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `habilitado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `producto`, `marca`, `fecha_creacion`, `fecha_actualizado`, `habilitado`) VALUES
(1, 'Leche', 'Colun', '2025-05-03 21:22:39', '2025-05-03 21:22:39', 1),
(2, 'Cereal', 'Kellogg\'s', '2025-05-03 21:22:39', '2025-05-09 00:23:44', 1),
(3, 'Galletas', 'Costa', '2025-05-03 21:22:39', '2025-05-03 21:22:39', 1),
(4, 'jugo de agua', 'Watts', '2025-05-03 21:22:39', '2025-05-04 20:34:31', 1),
(5, 'Agua lol', 'Puyehue', '2025-05-03 21:22:39', '2025-05-04 20:51:39', 1),
(6, 'Pan Integral', 'MiMarca', '2025-05-06 00:34:26', '2025-05-06 00:34:26', 1),
(7, 'Galletas trencito', 'Nestle', '2025-05-28 02:41:06', '2025-05-28 02:41:06', 1),
(8, 'Papitas', 'Tarro', '2025-05-28 02:44:54', '2025-05-28 02:44:54', 1),
(9, 'Marakillas', 'Sembrasol', '2025-05-28 02:44:54', '2025-05-28 02:44:54', 1),
(10, 'Leche milo', 'Milo', '2025-05-28 22:48:52', '2025-05-28 22:48:52', 1),
(11, 'Monster', 'Energetica', '2025-05-28 23:29:00', '2025-05-28 23:29:00', 1),
(15, 'Papas queso', 'Kryzpo', '2025-06-07 15:59:54', '2025-06-07 15:59:54', 1),
(16, 'Talco', 'Brooks', '2025-06-10 01:54:09', '2025-06-10 01:54:09', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id`, `fecha`, `total`) VALUES
(1, '2025-05-29 22:38:57', 2000.00),
(2, '2025-06-01 18:49:40', 18000.00),
(3, '2025-06-01 23:00:45', 18000.00),
(4, '2025-06-07 09:46:25', 6000.00),
(7, '2025-06-07 09:48:43', 3000.00),
(8, '2025-06-07 10:56:37', 69000.00),
(9, '2025-06-07 12:15:21', 92500.00),
(10, '2025-06-07 12:20:51', 2500.00),
(11, '2025-06-07 12:24:04', 2500.00),
(12, '2025-06-07 12:28:03', 25000.00),
(13, '2025-06-07 12:32:03', 5000.00),
(14, '2025-06-07 12:53:35', 2500.00),
(15, '2025-06-07 13:13:37', 42500.00),
(16, '2025-06-07 13:14:29', 2500.00),
(17, '2025-06-07 13:45:31', 2500.00),
(18, '2025-06-07 13:46:00', 5000.00),
(19, '2025-06-07 13:47:50', 30000.00),
(20, '2025-06-07 15:44:59', 5000.00),
(21, '2025-06-07 15:45:23', 2500.00),
(22, '2025-06-07 16:00:37', 30000.00),
(23, '2025-06-07 16:03:52', 2500.00),
(24, '2025-06-07 16:09:00', 2500.00),
(25, '2025-06-07 16:24:38', 2500.00),
(26, '2025-06-07 17:17:01', 7500.00),
(27, '2025-06-07 17:17:27', 2500.00),
(28, '2025-06-07 17:35:25', 7500.00),
(29, '2025-06-08 11:12:30', 2500.00),
(30, '2025-06-08 11:13:14', 5000.00),
(31, '2025-06-08 11:25:42', 12500.00),
(32, '2025-06-08 11:33:59', 5000.00),
(33, '2025-06-08 12:03:39', 2500.00),
(35, '2025-06-08 22:48:54', 2500.00),
(36, '2025-06-08 23:13:29', 10000.00),
(37, '2025-06-08 23:15:23', 2500.00),
(38, '2025-06-09 20:38:59', 7500.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_venta` (`id_venta`),
  ADD KEY `id_formato_producto` (`id_formato_producto`);

--
-- Indices de la tabla `fcm_tokens`
--
ALTER TABLE `fcm_tokens`
  ADD PRIMARY KEY (`token`);

--
-- Indices de la tabla `formato_producto`
--
ALTER TABLE `formato_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_barra` (`codigo_barra`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `formato_producto`
--
ALTER TABLE `formato_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_formato_producto`) REFERENCES `formato_producto` (`id`);

--
-- Filtros para la tabla `formato_producto`
--
ALTER TABLE `formato_producto`
  ADD CONSTRAINT `formato_producto_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
