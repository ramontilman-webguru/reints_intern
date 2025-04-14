// app/dashboard/customers/page.jsx (aangepast)
import { getCustomers } from "@/lib/data-service";
import CustomersTable from "@/components/customers-table";
import AddCustomerDialog from "@/components/add-customer-dialog";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-3xl font-bold tracking-tight'>Klanten</h2>
        <AddCustomerDialog />
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
