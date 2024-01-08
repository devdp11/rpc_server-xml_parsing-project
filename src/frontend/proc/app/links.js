import HomeIcon from "@mui/icons-material/Home";
import { CarCrash } from "@mui/icons-material";

const LINKS = [
    {text: 'Home', href: '/', icon: HomeIcon},
    {text: 'Brands', href: '/allBrands', icon: CarCrash },
    {text: 'Brands by Country', href: '/brands', icon: CarCrash },
    {text: 'Models by Brand', href: '/models', icon: CarCrash },
    {text: 'Cars', href: '/vehicles', icon: CarCrash },
    {text: 'Brands Count', href: '/brandsCount', icon: CarCrash },
    {text: 'Models Count', href: '/modelsCount', icon: CarCrash },
    {text: 'Number of Cars', href: '/vehiclesCount', icon: CarCrash },
    {text: 'Models Percentage', href: '/stats', icon: CarCrash }
];
export default LINKS;