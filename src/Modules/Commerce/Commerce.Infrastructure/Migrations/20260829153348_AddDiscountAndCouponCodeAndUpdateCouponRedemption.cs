using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Commerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountAndCouponCodeAndUpdateCouponRedemption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "CouponRedemptions",
                newName: "BuyerEmail");

            migrationBuilder.RenameIndex(
                name: "IX_CouponRedemptions_CouponId_UserId",
                table: "CouponRedemptions",
                newName: "IX_CouponRedemptions_CouponId_BuyerEmail");

            migrationBuilder.AddColumn<string>(
                name: "CouponCode",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Orders",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "CouponRedemptions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_CouponRedemptions_Coupons_CouponId",
                table: "CouponRedemptions",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CouponRedemptions_Coupons_CouponId",
                table: "CouponRedemptions");

            migrationBuilder.DropColumn(
                name: "CouponCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "CouponRedemptions");

            migrationBuilder.RenameColumn(
                name: "BuyerEmail",
                table: "CouponRedemptions",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CouponRedemptions_CouponId_BuyerEmail",
                table: "CouponRedemptions",
                newName: "IX_CouponRedemptions_CouponId_UserId");
        }
    }
}
