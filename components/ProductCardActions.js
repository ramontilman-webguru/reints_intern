"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/actions/productActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProductCardActions({ productId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (result?.error) {
        // TODO: Show error feedback (e.g., toast)
        alert(`Error deleting product: ${result.error}`);
      } else {
        // No need to redirect, revalidation handles the list update
        // Optionally show success message
        router.refresh(); // Ensure UI updates if revalidation is delayed
      }
    });
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Edit Button */}
      <Button variant='outline' size='sm' asChild>
        <Link href={`/dashboard/products/${productId}/edit`}>
          <Edit className='h-4 w-4 mr-1' />
          Edit
        </Link>
      </Button>

      {/* Delete Button with Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive' size='sm' disabled={isPending}>
            <Trash2 className='h-4 w-4 mr-1' />
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product. Check if this product is linked to any orders before
              deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {isPending ? "Deleting..." : "Yes, delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
