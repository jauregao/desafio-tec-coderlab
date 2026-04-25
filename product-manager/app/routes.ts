import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("products/new", "routes/products-new.tsx"),
	route("categories/new", "routes/categories-new.tsx"),
] satisfies RouteConfig;
