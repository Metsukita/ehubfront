import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback className="bg-gray-700 text-white">OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Olivia Martin</p>
          <p className="text-sm text-gray-400">
            olivia.martin@gmail.com
          </p>
        </div>
        <div className="ml-auto font-medium text-green-500">+R$242.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback className="bg-gray-700 text-white">JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Jackson Lee</p>
          <p className="text-sm text-gray-400">
            jackson.lee@email.com
          </p>
        </div>
        <div className="ml-auto font-medium text-green-500">+R$150.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/03.png" alt="Avatar" />
          <AvatarFallback className="bg-gray-700 text-white">IN</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Isabella Nguyen</p>
          <p className="text-sm text-gray-400">
            isabella.nguyen@email.com
          </p>
        </div>
        <div className="ml-auto font-medium text-green-500">+R$350.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/04.png" alt="Avatar" />
          <AvatarFallback className="bg-gray-700 text-white">WK</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Will Kim</p>
          <p className="text-sm text-gray-400">
            will@email.com
          </p>
        </div>
        <div className="ml-auto font-medium text-green-500">+R$99.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/05.png" alt="Avatar" />
          <AvatarFallback className="bg-gray-700 text-white">SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Sofia Davis</p>
          <p className="text-sm text-gray-400">
            sofia.davis@email.com
          </p>
        </div>
        <div className="ml-auto font-medium text-green-500">+R$299.00</div>
      </div>
      {/* Adicione mais divs como a de cima para completar a lista */}
    </div>
  )
}